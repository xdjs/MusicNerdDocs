import { existsSync, readFileSync } from 'node:fs';
import { test, expect } from 'vitest';
const { buildCurl, resolveReference }: typeof import('../lib/docs-server') = await import(new URL('../lib/docs-server.ts',import.meta.url).href);
const { resolveDocsHref }: typeof import('../lib/docs-paths') = await import(new URL('../lib/docs-paths.ts',import.meta.url).href);
const pages=JSON.parse(readFileSync(new URL('../content/manifest.json',import.meta.url),'utf8'));
const inventory=JSON.parse(readFileSync(new URL('../content/inventory.json',import.meta.url),'utf8'));
const config=JSON.parse(readFileSync(new URL('../content/source/docs.json',import.meta.url),'utf8'));
const specs=Object.fromEntries(inventory.specifications.map((name:string)=>[name,JSON.parse(readFileSync(new URL(`../content/source/api-reference/openapi/${name}`,import.meta.url),'utf8'))]));

test('every navigation page is built, and every OpenAPI operation has a reference page',()=>{
 expect(new Set(pages.map((page:{slug:string})=>page.slug)).size).toBe(pages.length);
 const navPages=config.navigation.tabs.flatMap((tab:{groups:{pages:string[]}[]})=>tab.groups.flatMap(group=>group.pages));
 for(const slug of navPages)expect(pages.some((page:{slug:string})=>page.slug===(slug==='index'?'':slug)), `Missing nav page ${slug}`).toBeTruthy();
 expect(inventory.gaps).toEqual([]);
 expect(inventory.additionalOperations).toEqual([]);
 for(const [name,spec] of Object.entries(specs))for(const [endpoint,path] of Object.entries(spec.paths))for(const method of Object.keys(path as object)) {
  if(!['get','post','put','patch','delete','head','options'].includes(method))continue;
  expect(pages.some((page:{api?:{spec:string;path:string;method:string}})=>page.api?.spec===name&&page.api.path===endpoint&&page.api.method===method.toUpperCase()), `Missing operation ${name}: ${method} ${endpoint}`).toBeTruthy();
 }
});

test('guide links resolve to pages or public files on this site',()=>{
 const valid=new Set(['/','/api-reference','/llms.txt','/llms-full.txt',...pages.map((page:{slug:string})=>`/${page.slug}`)]);
 const isPublicFile=(url:string)=>existsSync(new URL(`../public${url}`,import.meta.url));
 for(const page of pages)for(const [,url] of page.body.matchAll(/(?:href="|\]\()(\/[^"\s)]+)/g))expect(valid.has(resolveDocsHref(url).split('#')[0])||isPublicFile(url), `Broken docs link ${page.slug}: ${url}`).toBeTruthy();
 expect(resolveDocsHref('https://docs.musicnerd.xyz/quickstart#call')).toBe('/quickstart#call');
 expect(resolveDocsHref('/index')).toBe('/');
});

test('every OpenAPI reference resolves inside its own document',()=>{
 for(const [name,spec] of Object.entries(specs)) {
  const visit=(value:unknown)=>{if(Array.isArray(value))return value.forEach(visit);if(value&&typeof value==='object'){const obj=value as Record<string,unknown>;if(typeof obj.$ref==='string'){expect(obj.$ref.startsWith('#/')).toBeTruthy();expect(!resolveReference(obj,spec).$ref, `Unresolved ${name}: ${obj.$ref}`).toBeTruthy();}Object.values(obj).forEach(visit);}};visit(spec);
 }
});

test('every operation declares its security, so the reference and playground never guess',()=>{
 for(const [name,spec] of Object.entries(specs))for(const [endpoint,path] of Object.entries(spec.paths))for(const [method,operation] of Object.entries(path as Record<string,{security?:unknown[]}>)) {
  expect(Array.isArray(operation.security), `${name}: ${method} ${endpoint} has no security`).toBeTruthy();
  for(const requirement of operation.security as Record<string,unknown>[])for(const scheme of Object.keys(requirement))expect(spec.components?.securitySchemes?.[scheme], `${name}: undefined scheme ${scheme}`).toBeTruthy();
 }
});

test('request examples replace path values, encode required query values, and respect authentication',()=>{
 const spec={servers:[{url:'https://musicnerd-api.vercel.app'}],components:{securitySchemes:{token:{type:'http',scheme:'bearer'}}}};
 const operation={security:[{token:[]}],parameters:[{name:'q',in:'query',required:true,example:'song & artist'},{name:'optional',in:'query',required:false}]};
 const curl=buildCurl({method:'GET',endpoint:'/api/artist/{artistId}',spec,operation});
 expect(curl).toMatch(/YOUR_ARTIST_ID\?q=song\+%26\+artist/);expect(curl).toMatch(/Authorization: Bearer YOUR_TOKEN/);expect(!curl.includes('optional')).toBeTruthy();
 const health=specs['health.json'];
 expect(buildCurl({method:'GET',endpoint:'/api/health',spec,operation:{security:[]},baseUrl:'https://musicnerd-api-staging.vercel.app'})).toContain("--url 'https://musicnerd-api-staging.vercel.app/api/health'");
 const anonymous=buildCurl({method:'GET',endpoint:'/api/health',spec:health,operation:health.paths['/api/health'].get});expect(!anonymous.includes('--header')).toBeTruthy();
 const json=buildCurl({method:'POST',endpoint:'/api/artist',spec,operation:{security:[],requestBody:{content:{'application/json':{example:{name:"Artist's catalog"}}}}}});expect(json).toMatch(/Artist'"'"'s catalog/);
});

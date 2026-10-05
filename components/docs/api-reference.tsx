import Link from 'next/link';
import type { ReactNode } from 'react';
import { docs, docHref, type DocPage } from '@/lib/docs';
import { getDocSpec, resolveReference, buildCurl, type ApiObject } from '@/lib/docs-server';
import { DocsCode } from './docs-interactive';
import { DocDescription, DocInlineDescription } from './docs-content';
import { TryIt } from './playground/try-it';
import { summarizeOperation } from '@/lib/docs/playground/summarizeOperation';
import { responseExamples } from '@/lib/docs/ui/responseExamples';
import { splitDescription } from '@/lib/docs/ui/splitDescription';
import { isStagingApiUrl } from '@/lib/docs/ui/isStagingApiUrl';
import { siteConfig } from '@/lib/config';
import { CopyPage } from './copy-page';
import { EndpointPath } from './endpoint-bar';
import { ResponseExamplesCard } from './response-examples-card';
import { ResponseSwitcher } from './response-switcher';

function typeName(schema:ApiObject): string {
 if(schema.$ref)return schema.$ref.split('/').pop();
 if(Array.isArray(schema.type))return schema.type.join(' | ');
 if(schema.enum)return `${schema.type||'string'} · enum`;
 if(schema.type==='array')return `array<${typeName(schema.items||{})}>`;
 return schema.type|| (schema.properties?'object':schema.oneOf?'one of':schema.anyOf?'any of':schema.allOf?'all of':'any');
}
function Schema({value,spec,depth=0,seen=[]}:{value:ApiObject;spec:ApiObject;depth?:number;seen?:string[]}) {
 if(value.$ref && seen.includes(value.$ref))return <p className="docs-schema-cycle">Recursive type: <code>{value.$ref.split('/').pop()}</code>. See the full specification for this definition.</p>;
 const visited=value.$ref?[...seen,value.$ref]:seen;
 const schema=resolveReference(value,spec);
 const properties=Object.entries(schema.properties||{}) as [string,ApiObject][];
 return <div className="docs-schema">
  {!properties.length&&schema.required?.length>0&&<p className="docs-property-values">Required: {schema.required.join(', ')}</p>}
  {properties.map(([name,raw])=>{const prop=resolveReference(raw,spec);const nested=prop.properties||prop.items||prop.oneOf||prop.allOf||prop.anyOf;return <div className="docs-property" key={name}><div className="docs-property-heading"><code>{name}</code><span>{typeName(prop)}</span>{schema.required?.includes(name)&&<em>required</em>}{prop.nullable&&<span>nullable</span>}{prop.readOnly&&<span>read only</span>}</div><DocDescription text={prop.description}/>{prop.enum&&<p className="docs-property-values">Values: {prop.enum.map((item:unknown)=>JSON.stringify(item)).join(', ')}</p>}{prop.default!==undefined&&<p className="docs-property-values">Default: <code>{JSON.stringify(prop.default)}</code></p>}{['format','minimum','maximum','minLength','maxLength','pattern','minItems','maxItems'].some(key=>prop[key]!==undefined)&&<p className="docs-property-values">{['format','minimum','maximum','minLength','maxLength','pattern','minItems','maxItems'].filter(key=>prop[key]!==undefined).map(key=>`${key}: ${prop[key]}`).join(' · ')}</p>}{nested&&depth<12&&<details className="docs-schema-details"><summary>{prop.type==='array'?'Item properties':'Properties'}<span className="docs-sr-only"> for {name}</span></summary><Schema value={prop.items||raw} spec={spec} depth={depth+1} seen={visited}/></details>}</div>;})}
  {schema.items&&<Schema value={schema.items} spec={spec} depth={depth+1} seen={visited}/>}
  {(['oneOf','anyOf','allOf'] as const).map(kind=>schema[kind]?.map((variant:ApiObject,index:number)=><details className="docs-schema-details" key={`${kind}-${index}`}><summary>{kind} · {typeName(variant)} {index+1}</summary><DocDescription text={resolveReference(variant,spec).description}/><Schema value={variant} spec={spec} depth={depth+1} seen={visited}/></details>))}
  {!properties.length&&!schema.items&&!schema.oneOf&&!schema.anyOf&&!schema.allOf&&(!schema.required?.length||schema.type||schema.enum)&&<p className="docs-property-values"><code>{typeName(schema)}</code>{schema.enum?` · ${schema.enum.map((v:unknown)=>JSON.stringify(v)).join(', ')}`:''}</p>}
  {schema.additionalProperties&&<details className="docs-schema-details"><summary>Additional properties</summary>{typeof schema.additionalProperties==='object'?<Schema value={schema.additionalProperties} spec={spec} depth={depth+1} seen={visited}/>:<p>Additional keys are allowed.</p>}</details>}
 </div>;
}
function ParameterRow({param,spec}:{param:ApiObject;spec:ApiObject}) {
 return <div className="docs-property"><div className="docs-property-heading"><code>{param.name}</code><span>{typeName(param.schema||{})}</span>{param.required&&<em>required</em>}</div><DocDescription text={param.description}/>{param.schema?.enum&&<p className="docs-property-values">Values: {param.schema.enum.map((v:unknown)=>JSON.stringify(v)).join(', ')}</p>}{param.schema?.default!==undefined&&<p className="docs-property-values">Default: {JSON.stringify(param.schema.default)}</p>}{param.schema?.properties&&<Schema value={param.schema} spec={spec}/>}</div>;
}
function Authorizations({security,spec}:{security:ApiObject[]|undefined;spec:ApiObject}) {
 const schemes=[...new Set((security??[]).flatMap(item=>Object.keys(item)))].map(name=>({name,scheme:spec.components?.securitySchemes?.[name]||{}}));
 return <section id="authorizations" className="mn-section"><h2>Authorizations</h2>{security?.length===0?<p className="mn-section-note">None. This endpoint is public.</p>:schemes.length?schemes.map(({name,scheme})=>{const bearer=scheme.scheme==='bearer';return <div className="docs-property" key={name}><div className="docs-property-heading"><code>{bearer?'Authorization':scheme.name||name}</code><span>string</span><span>{bearer?'header':scheme.in||'header'}</span><em>required</em></div><DocDescription text={`${bearer?'Bearer authentication header of the form `Bearer <token>`. ':''}${scheme.description||''}`}/></div>;}):<p className="mn-section-note">See the <Link href="/authentication">authentication guide</Link>.</p>}</section>;
}
export async function EndpointPage({page,footer}:{page:DocPage;footer?:ReactNode}) {
 if(!page.api?.spec)return null;
 const doc=await getDocSpec(page.api.spec);
 const pathItem=doc.paths[page.api.path]||{};
 const operation=pathItem[page.api.method.toLowerCase()];
 if(!operation)return <aside className="docs-callout docs-callout-warning"><span>Reference note</span><p>{page.gap}</p></aside>;
 const parameters=[...(pathItem.parameters||[]),...(operation.parameters||[])].map(param=>resolveReference(param,doc));
 const body=resolveReference(operation.requestBody,doc);
 const security=operation.security??doc.security;
 const request=buildCurl({method:page.api.method,endpoint:page.api.path,spec:doc,operation,pathItem,baseUrl:siteConfig.apiUrl});
 const {lead,rest}=splitDescription(operation.description);
 const playground=summarizeOperation({method:page.api.method,path:page.api.path,spec:doc});
 const endpoints=docs.filter(item=>item.api).map(item=>({href:docHref(item.slug),title:item.title,method:item.api!.method}));
 const responses=Object.entries(operation.responses||{}).map(([status,raw])=>{const response=resolveReference(raw as ApiObject,doc);const [mediaType,media]=Object.entries(response.content||{})[0]??[];return {status,mediaType,panel:<div className="mn-response-panel"><DocDescription text={response.description}/>{Object.entries(response.headers||{}).map(([name,value])=><div key={name} className="docs-property"><div className="docs-property-heading"><code>{name}</code><span>response header</span></div><DocDescription text={resolveReference(value as ApiObject,doc).description}/></div>)}{(media as ApiObject|undefined)?.schema&&<Schema value={(media as ApiObject).schema} spec={doc}/>}</div>};});
 return <div className="mn-endpoint-page">
  <header className="mn-endpoint-head">
   <p className="mn-label">{page.group}</p>
   <h1>{page.title}</h1>
   {lead&&<p className="mn-lead"><DocInlineDescription text={lead}/></p>}
   {rest&&<DocDescription text={rest}/>}
   {operation.deprecated&&<aside className="docs-callout docs-callout-warning"><span>Deprecated</span><p>This endpoint is marked deprecated in the source specification.</p></aside>}
   <CopyPage slug={page.slug}/>
   <div className="mn-endpoint-bar"><EndpointPath method={page.api.method} path={page.api.path}/><TryIt operation={playground} baseUrl={siteConfig.apiUrl} staging={isStagingApiUrl(siteConfig.apiUrl)} title={page.title} lead={lead&&<DocInlineDescription text={lead}/>} endpoints={endpoints} descriptions={{auth:playground.authDescription?<DocInlineDescription text={playground.authDescription}/>:undefined,params:Object.fromEntries(playground.parameters.filter(param=>param.description).map(param=>[`${param.in}:${param.name}`,<DocInlineDescription key={param.name} text={param.description}/>]))}}/></div>
  </header>
  <aside className="mn-examples" aria-label="Examples">
   <DocsCode language="bash" label="cURL">{request}</DocsCode>
   <ResponseExamplesCard examples={responseExamples(operation,doc)}/>
  </aside>
  <div className="mn-endpoint-main">
   <Authorizations security={security} spec={doc}/>
   {(['path','query','header','cookie'] as const).map(location=>{const list=parameters.filter(param=>param.in===location);return list.length?<section id={`${location}-parameters`} className="mn-section" key={location}><h2>{location.charAt(0).toUpperCase()+location.slice(1)} Parameters</h2>{list.map(param=><ParameterRow key={param.name} param={param} spec={doc}/>)}</section>:null;})}
   {body.content&&<section id="body" className="mn-section">{Object.entries(body.content).map(([format,media])=><div key={format}><div className="mn-section-head"><h2>Body</h2><span className="mn-media-type">{format}</span>{body.required&&<span className="docs-required-label">required</span>}</div><DocDescription text={body.description}/>{(media as ApiObject).schema&&<Schema value={(media as ApiObject).schema} spec={doc}/>}</div>)}</section>}
   <ResponseSwitcher responses={responses}/>
   {footer}
  </div>
 </div>;
}

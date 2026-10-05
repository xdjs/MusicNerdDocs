import { Arrow } from '@/components/arrow';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { docs, docHref, type DocPage } from '@/lib/docs';
import { documentationJsonLd } from '@/lib/seo/documentationJsonLd';
import { documentationMetadata } from '@/lib/seo/documentationMetadata';
import { SidebarNav } from '@/components/docs/sidebar-nav';
import { DocsContent } from '@/components/docs/docs-content';
import { EndpointPage } from '@/components/docs/api-reference';
import { CopyPage } from '@/components/docs/copy-page';
import { MethodPill } from '@/components/docs/method-pill';
import '../docs.css';

type Props={params:Promise<{slug?:string[]}>};
export const dynamicParams = false;
export function generateStaticParams(){return [{slug:[]},{slug:['api-reference']},...docs.filter(page=>page.slug).map(page=>({slug:page.slug.split('/')}))];}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug=[]}=await params;const key=slug.join('/');const page=docs.find(item=>item.slug===key);if(!page&&key!=='api-reference')notFound();return documentationMetadata(page,key);}

const navPages=docs.map(({slug,title,category,group,api,searchText})=>({slug,title,category,group,api,searchText}));
const apiGroups=[...new Set(docs.filter(page=>page.api).map(page=>page.group))];
const groupId=(group:string)=>group.toLowerCase().replace(/[^a-z]+/g,'-');

function ApiOverview(){
 return <article className="mn-article">
  <header className="mn-article-head"><p className="mn-label">API reference</p><h1>The Music Nerd API</h1><p className="mn-lead">Artist profiles, research and onboarding. Find the endpoint you need and try it from the page.</p></header>
  <div className="docs-api-overview">{apiGroups.map(group=><section key={group} id={groupId(group)}><h2>{group}</h2><div>{docs.filter(page=>page.api&&page.group===group).map(page=><Link href={docHref(page.slug)} key={page.slug}><MethodPill method={page.api!.method}/><strong>{page.title}</strong><code>{page.api!.path}</code><span aria-hidden="true"><Arrow direction="right"/></span></Link>)}</div></section>)}</div>
 </article>;
}
function Pagination({page}:{page:DocPage}){
 const index=docs.indexOf(page);const previous=index>0?docs[index-1]:null;const next=docs[index+1];
 return <nav className="docs-pagination" aria-label="Documentation pages">{previous?<Link href={docHref(previous.slug)}><Arrow direction="left"/>{previous.slug?previous.title:'Introduction'}</Link>:<span/>}{next&&<Link href={docHref(next.slug)}>{next.title}<Arrow direction="right"/></Link>}</nav>;
}
function GuidePage({page}:{page:DocPage}){
 return <div className="mn-guide">
  <article className="mn-article">
   <header className={`mn-article-head${!page.slug?' mn-article-intro':''}`}>
    <p className="mn-label">{page.group}</p>
    <h1>{page.slug?page.title:'Build with Music Nerd'}</h1>
    {page.description&&<p className="mn-lead">{page.description}</p>}
    <CopyPage slug={page.slug}/>
   </header>
   {page.compiled&&<DocsContent compiled={page.compiled}/>}
   <Pagination page={page}/>
  </article>
  {page.headings.length>0&&<aside className="mn-toc"><p>On this page</p><nav aria-label="On this page">{page.headings.map((heading,index)=><a key={`${heading.id}-${index}`} href={`#${heading.id}`}>{heading.title}</a>)}</nav></aside>}
 </div>;
}
export default async function Documentation({params}:Props){
 const {slug=[]}=await params;const key=slug.join('/');const page=docs.find(item=>item.slug===key);const overview=key==='api-reference';
 if(!page&&!overview)notFound();
 return <div className="docs-layout">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(documentationJsonLd(page,key)).replace(/</g,"\\u003c")}}/>
  <aside className="docs-sidebar"><SidebarNav pages={navPages}/></aside>
  <main className="docs-main" id="content">
   {overview?<ApiOverview/>:page!.api?<EndpointPage page={page!} footer={<Pagination page={page!}/>}/>:<GuidePage page={page!}/>}
  </main>
 </div>;
}

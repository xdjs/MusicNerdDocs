import { docs } from '@/lib/docs';
import { documentationAgentMarkdown } from '@/lib/agent-markdown';
import { absoluteUrl } from '@/lib/seo/absoluteUrl';
import { docHref } from '@/lib/docs-paths';
export async function GET(_request:Request,{params}:{params:Promise<{slug:string[]}>}) {
 const {slug}=await params;const key=slug.join('/').replace(/\.mdx?$/,'');
 const page=docs.find(item=>item.slug===(key==='index'?'':key));
 if(!page)return new Response('Documentation not found',{status:404});
 const text=await documentationAgentMarkdown(page);
 return new Response(text,{headers:{'Content-Type':'text/markdown; charset=utf-8','Link':`<${absoluteUrl(docHref(page.slug))}>; rel="canonical"`}});
}

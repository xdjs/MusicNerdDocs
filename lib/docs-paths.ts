export const docHref = (slug: string) => slug ? `/${slug}` : '/';
export function headingId(text: string) { return text.toLowerCase().replace(/[`*]/g,'').replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-'); }
export function resolveDocsHref(href?: string) {
 if(!href)return '#';
 href=href.replace(/^https:\/\/docs\.musicnerd\.xyz(?=\/|$)/,'');
 if(href.startsWith('#')||/^(mailto:|https?:)/.test(href))return href;
 const [pathname,...fragment]=href.split('#');
 const suffix=fragment.length?`#${fragment.join('#')}`:'';
 if(pathname==='/index'||pathname==='')return '/'+suffix;
 return href;
}

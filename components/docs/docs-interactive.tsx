'use client';
import { useState, useEffect, useRef, useId, Children, isValidElement, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { highlightCode } from '@/lib/docs/ui/highlightCode';

export function DocsCode({children,language='text',label,heading}:{children:string;language?:string;label?:string;heading?:ReactNode}) {
 const [copied,setCopied]=useState(false);
 const [failed,setFailed]=useState(false);
 const code=useRef<HTMLElement>(null);
 const viewport=useRef<HTMLPreElement>(null);
 const [overflowing,setOverflowing]=useState(false);
 const hintId=useId();
 useEffect(()=>{
  const element=viewport.current;
  if(!element)return;
  let active=true;
  const measure=()=>{if(active)setOverflowing(element.scrollWidth>element.clientWidth+1);};
  measure();
  void document.fonts.ready.then(measure);
  if(typeof ResizeObserver==='undefined'){
   window.addEventListener('resize',measure);
   return()=>{active=false;window.removeEventListener('resize',measure);};
  }
  const observer=new ResizeObserver(measure);
  observer.observe(element);
  return()=>{active=false;observer.disconnect();};
 },[children]);
 const timeout=useRef<ReturnType<typeof setTimeout> | null>(null);
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current);},[]);
 async function copy(){
  try{
   await navigator.clipboard.writeText(children);
   setCopied(true);setFailed(false);
   if(timeout.current)clearTimeout(timeout.current);
   timeout.current=setTimeout(()=>setCopied(false),1800);
  }catch{
   setCopied(false);setFailed(true);
   if(code.current){
    const range=document.createRange();range.selectNodeContents(code.current);
    const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);
   }
  }
 }
 return <div className="docs-code">
  <div className="docs-code-heading"><span>{heading??label??language}</span><button type="button" onClick={copy} aria-label={copied?'Copied':`Copy ${label||language}`} title={copied?'Copied':'Copy'}>{copied?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>}</button></div>
  <pre ref={viewport} tabIndex={0} role="region" aria-label={`${label||language} code sample`} aria-describedby={overflowing?hintId:undefined}><code ref={code} className={`language-${language}`}>{highlightCode(children,language).map((token,index)=>token.kind?<span key={index} className={`tok-${token.kind}`}>{token.text}</span>:token.text)}</code></pre>
  {overflowing&&<p id={hintId} className="docs-code-hint">Scroll sideways to see the full code</p>}
  <p className={failed?'docs-copy-feedback':'docs-sr-only'} role="status">{failed?'Copy wasn’t available. Select the code and use your device’s copy command.':copied?'Code copied.':''}</p>
 </div>;
}
export function DocsCodeGroup({children}:{children:ReactNode}) {
 const blocks=Children.toArray(children).filter(isValidElement);
 const [active,setActive]=useState(0);
 const id=useId();
 const tabs=useRef<(HTMLButtonElement|null)[]>([]);
 function navigate(event:ReactKeyboardEvent<HTMLButtonElement>,index:number){
  const next=event.key==='ArrowRight'?(index+1)%blocks.length
   :event.key==='ArrowLeft'?(index-1+blocks.length)%blocks.length
    :event.key==='Home'?0:event.key==='End'?blocks.length-1:undefined;
  if(next===undefined)return;
  event.preventDefault();setActive(next);tabs.current[next]?.focus();
 }
 return <div className="docs-code-group">
  <div className="docs-code-tabs" role="tablist" aria-label="Code language">{blocks.map((block,index)=>{
   const props=block.props as {language?:string;children?:{props?:{className?:string}}};
   const language=props.language || props.children?.props?.className?.replace('language-','') || `Example ${index+1}`;
   return <button key={index} id={`${id}-tab-${index}`} ref={element=>{tabs.current[index]=element;}} type="button" role="tab" aria-selected={index===active} aria-controls={`${id}-panel`} tabIndex={index===active?0:-1} onClick={()=>setActive(index)} onKeyDown={event=>navigate(event,index)}>{language}</button>;
  })}</div>
  <div key={active} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>{blocks[active]}</div>
 </div>;
}

export function DocsTable({children,label='Documentation table'}:{children:ReactNode;label?:string}) {
 const region=useRef<HTMLDivElement>(null);
 const [overflowing,setOverflowing]=useState(false);
 const hintId=useId();
 useEffect(()=>{
  const element=region.current;
  if(!element)return;
  const measure=()=>setOverflowing(element.scrollWidth>element.clientWidth);
  measure();
  if(typeof ResizeObserver==='undefined'){
   window.addEventListener('resize',measure);
   return()=>window.removeEventListener('resize',measure);
  }
  const observer=new ResizeObserver(measure);
  observer.observe(element);
  const table=element.querySelector('table');
  if(table)observer.observe(table);
  return()=>observer.disconnect();
 },[children]);
 return <div className="docs-table-container">
  <div ref={region} className="docs-table-scroll" tabIndex={0} role="region" aria-label={label} aria-describedby={overflowing?hintId:undefined}>{children}</div>
  {overflowing&&<p id={hintId} className="docs-table-hint">Scroll to see all columns</p>}
 </div>;
}

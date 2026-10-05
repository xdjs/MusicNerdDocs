"use client";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import type { NavPage } from "@/lib/docs";
import { currentTab } from "@/lib/docs/ui/currentTab";
import { Brand } from "./brand";
import { closeOnBackdrop } from "./close-on-backdrop";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";

/** The phone navigation drawer, as Mintlify's: it slides in from the left over a dimmed page and closes on a tap outside or Escape. */
export function NavDrawer({ pages, tabs }: { pages: NavPage[]; tabs: { name: string; href: string }[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const close = () => dialog.current?.close();
  return (
    <>
      <button type="button" className="mn-icon-button" aria-label="Open navigation" onClick={() => dialog.current?.showModal()}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <dialog ref={dialog} className="mn-drawer" aria-label="Navigation" onClick={(event) => closeOnBackdrop(event, close)}>
        <div className="mn-drawer-body" tabIndex={-1} autoFocus>
          <div className="mn-drawer-top">
            <Brand onNavigate={close} />
            <ThemeToggle />
          </div>
          <label className="mn-tab-select">
            <span className="mn-sr-only">Section</span>
            <select
              value={currentTab(pages, pathname)}
              onChange={(event) => {
                const tab = tabs.find((item) => item.name === event.target.value);
                if (tab) router.push(tab.href);
              }}
            >
              {tabs.map((tab) => <option key={tab.name} value={tab.name}>{tab.name}</option>)}
            </select>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </label>
          <SidebarNav pages={pages} onNavigate={close} />
        </div>
      </dialog>
    </>
  );
}

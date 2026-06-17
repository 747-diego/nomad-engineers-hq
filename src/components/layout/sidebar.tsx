"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/wordmark";
import { NAV_ITEMS } from "./nav-items";

// Desktop-only collapsible left sidebar (spec §6).
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background pt-4 transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="flex items-center justify-between px-4 pb-6">
        {!collapsed && (
          <Link href="/" className="text-lg">
            <Wordmark suffix="HQ" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-nomad-muted-gray transition-colors hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-none px-3 py-2.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                active
                  ? "border-l-2 border-nomad-green bg-secondary text-foreground"
                  : "border-l-2 border-transparent text-nomad-muted-gray hover:text-foreground",
              )}
            >
              <Icon size={18} className={cn(active && "text-nomad-green")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

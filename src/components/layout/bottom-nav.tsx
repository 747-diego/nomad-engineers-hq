"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, MOBILE_PRIMARY, MOBILE_MORE } from "./nav-items";

const byHref = (href: string) => NAV_ITEMS.find((n) => n.href === href)!;

// Mobile-only bottom nav, 5 slots: 4 primary + a "More" drawer (spec §6).
export function BottomNav() {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background md:hidden">
        {MOBILE_PRIMARY.map((href) => {
          const { label, icon: Icon } = byHref(href);
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1"
            >
              <Icon
                size={20}
                className={active ? "text-nomad-green" : "text-nomad-muted-gray"}
              />
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-[0.08em]",
                  active ? "text-foreground" : "text-nomad-muted-gray",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawer(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1"
        >
          <MoreHorizontal size={20} className="text-nomad-muted-gray" />
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-nomad-muted-gray">
            More
          </span>
        </button>
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-nomad-green bg-card p-4 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="label-mono">More</span>
              <button onClick={() => setDrawer(false)} aria-label="Close">
                <X size={18} className="text-nomad-muted-gray" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_MORE.map((href) => {
                const { label, icon: Icon } = byHref(href);
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawer(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 border border-border p-4",
                      active && "border-nomad-green",
                    )}
                  >
                    <Icon
                      size={20}
                      className={active ? "text-nomad-green" : "text-foreground"}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

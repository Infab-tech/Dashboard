"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({ userRole, isLoggedIn }: { userRole?: string; isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-3">
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-neutral-900">
            InFAB Dashboard
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.filter((item) => {
          if ((item.label === "Admin" || item.label === "Financials") && userRole !== "ADMIN") {
            return false;
          }
          return true;
        }).map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span className="w-5 flex-shrink-0 text-center">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-2">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <span className="w-5 flex-shrink-0 text-center">✕</span>
            {!collapsed && <span className="truncate">{isLoggingOut ? "Logging out..." : "Log out"}</span>}
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <span className="w-5 flex-shrink-0 text-center">→</span>
            {!collapsed && <span className="truncate">Log in</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}

"use client";

import { useState, type ReactNode } from "react";

type TabKey = "users" | "financials";

const TABS: { key: TabKey; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "financials", label: "Financials" },
];

export function AdminTabs({ usersTab, financialsTab }: { usersTab: ReactNode; financialsTab: ReactNode }) {
  const [active, setActive] = useState<TabKey>("users");

  return (
    <div>
      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className={active === "users" ? "" : "hidden"}>{usersTab}</div>
        <div className={active === "financials" ? "" : "hidden"}>{financialsTab}</div>
      </div>
    </div>
  );
}

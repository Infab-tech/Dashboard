export type NavItem = {
  label: string;
  href: string;
  icon: string; // placeholder glyph until an icon set is chosen
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "◱" },
  { label: "Projects", href: "/projects", icon: "▤" },
  { label: "Workflow", href: "/workflow", icon: "⇄" },
  { label: "Timelines", href: "/timelines", icon: "▭" },
  { label: "Financials", href: "/financials", icon: "$" },
  { label: "Inventory", href: "/inventory", icon: "▣" },
  { label: "Vendors & Procurement", href: "/vendors-procurement", icon: "⇅" },
  { label: "Daily Log", href: "/daily-log", icon: "▦" },
  { label: "Assets", href: "/assets", icon: "◆" },
  { label: "People", href: "/people", icon: "◈" },
  { label: "Admin", href: "/admin", icon: "⚙" },
];

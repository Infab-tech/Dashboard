export type NavItem = {
  label: string;
  href: string;
  icon: string; // placeholder glyph until an icon set is chosen
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: "◱" },
  { label: "My Tasks", href: "/my-tasks", icon: "✓" },
  { label: "Projects", href: "/projects", icon: "▤" },
  { label: "Workflow", href: "/workflow", icon: "⇄" },
  { label: "Inventory", href: "/inventory", icon: "▣" },
  { label: "Vendors", href: "/vendors", icon: "⇅" },
  { label: "Procurements", href: "/procurements", icon: "🛒" },
  { label: "Delivery Challan", href: "/delivery-challan", icon: "📄" },
  { label: "Assets", href: "/assets", icon: "◆" },
  { label: "Daily Log", href: "/daily-log", icon: "▦" },
  { label: "People", href: "/people", icon: "◈" },
  { label: "Admin", href: "/admin", icon: "⚙" },
  { label: "Financials", href: "/financials", icon: "💰" },
];

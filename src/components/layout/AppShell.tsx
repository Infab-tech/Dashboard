import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalBackButton } from "@/components/layout/GlobalBackButton";

export function AppShell({ children, userRole, isLoggedIn }: { children: React.ReactNode; userRole: string; isLoggedIn?: boolean }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
      <Sidebar userRole={userRole} isLoggedIn={isLoggedIn} />
      <main className="flex-1 overflow-y-auto p-6">
        <GlobalBackButton />
        {children}
      </main>
    </div>
  );
}

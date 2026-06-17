import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";

// The persistent chrome wrapping every authenticated screen:
// green top bar, desktop sidebar, sticky top bar, mobile bottom nav.
export function AppShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* 4px green top bar — required on every screen, full width, sharp */}
      <div className="green-top-bar" />

      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar email={email} />
          <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

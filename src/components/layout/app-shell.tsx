import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";
import { UserProvider } from "@/components/user-provider";
import { QuickCaptureButton } from "@/components/quick-capture/quick-capture-button";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

// The persistent chrome wrapping every authenticated screen:
// green top bar, desktop sidebar, sticky top bar, mobile bottom nav,
// and the floating Quick Capture button (spec §5.10).
export function AppShell({
  userId,
  email,
  children,
}: {
  userId: string;
  email: string;
  children: React.ReactNode;
}) {
  return (
    <UserProvider id={userId} email={email}>
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
        <QuickCaptureButton />
        <KeyboardShortcuts />
      </div>
    </UserProvider>
  );
}

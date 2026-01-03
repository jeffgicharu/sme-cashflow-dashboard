import { BottomNav } from '@/components/navigation/bottom-nav';
import { TopNav } from '@/components/navigation/top-nav';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop navigation */}
      <TopNav />
      {/* Main content - wider on desktop, padding for bottom nav on mobile */}
      <main className="mx-auto max-w-lg px-0 pb-20 md:max-w-4xl md:px-6 md:pt-6 md:pb-8 lg:max-w-6xl">
        {children}
      </main>
      {/* Mobile navigation */}
      <BottomNav />
      <OfflineIndicator />
    </div>
  );
}

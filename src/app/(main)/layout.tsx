// Main App Layout — wraps all the main pages (feed, map, create, profile).
// Adds the sticky header at the top and bottom navigation bar.
// The (main) folder name with parentheses is a "route group" — it organizes
// files without affecting the URL. So /feed, not /(main)/feed.

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer>
      <Header />
      {/* pb-20 adds padding at the bottom so content doesn't hide behind the nav bar */}
      <main className="pb-20">{children}</main>
      <BottomNav />
    </MobileContainer>
  );
}

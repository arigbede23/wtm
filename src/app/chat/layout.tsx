// Chat Layout — minimal wrapper without Header or BottomNav.
// The chat view is outside the (main) route group so it gets its own layout.

import { MobileContainer } from "@/components/layout/MobileContainer";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MobileContainer>{children}</MobileContainer>;
}

// Auth Layout — wraps the login and signup pages.
// Centers the form in the middle of the screen.
// Uses the (auth) route group so these pages don't get the bottom nav bar.

import { MobileContainer } from "@/components/layout/MobileContainer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        {children}
      </main>
    </MobileContainer>
  );
}

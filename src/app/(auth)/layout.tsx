// Auth Layout — wraps the login and signup pages.
// Centers the form in the middle of the screen.
// Uses the (auth) route group so these pages don't get the bottom nav bar.

import { MobileContainer } from "@/components/layout/MobileContainer";
import { AuthThemeToggle } from "@/components/auth/AuthThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer>
      <div className="absolute right-4 top-4">
        <AuthThemeToggle />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        {children}
      </main>
    </MobileContainer>
  );
}

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

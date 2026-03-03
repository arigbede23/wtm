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
      <main className="pb-20">{children}</main>
      <BottomNav />
    </MobileContainer>
  );
}

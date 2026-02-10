import { Header } from "@/components/layout/Header";
import { GuestBanner } from "@/components/auth/GuestBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16">{children}</main>
      <GuestBanner />
    </div>
  );
}

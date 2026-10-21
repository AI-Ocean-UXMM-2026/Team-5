import { AppShell } from "@/components/layout/AppShell";

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell area="shared">{children}</AppShell>;
}

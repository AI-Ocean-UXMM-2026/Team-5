import { AppShell } from "@/components/layout/AppShell";

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell area="learner">{children}</AppShell>;
}

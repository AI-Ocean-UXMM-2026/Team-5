import { LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <Mascot pose="think" size={200} priority />
      <h1 className="text-h2">We can&apos;t find that page</h1>
      <p className="max-w-md text-body-lg text-muted">The link may be old, or the page may have moved.</p>
      <LinkButton href="/">Go home</LinkButton>
    </main>
  );
}

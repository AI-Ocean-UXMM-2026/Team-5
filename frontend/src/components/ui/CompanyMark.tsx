import Image from "next/image";
import type { Company } from "@/lib/types";

/** The company's logo, or its initials on a tinted tile when it hasn't uploaded one. */
export function CompanyMark({ company }: { company: Company }) {
  if (company.logo) return <Image src={company.logo} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 rounded-xl border border-line object-cover" />;
  const initials = company.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl bg-burgundy-tint font-heading text-body font-semibold text-burgundy">
      {initials}
    </span>
  );
}

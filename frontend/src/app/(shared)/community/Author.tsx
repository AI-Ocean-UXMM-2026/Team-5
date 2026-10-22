"use client";

import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { useData } from "@/lib/store";
import type { Lang, Post, State } from "@/lib/types";

export function Author({ userId, at }: { userId: string; at: string }) {
  const { s } = useData();
  const user = s.users.find((u) => u.id === userId);
  const company = s.companies.find((c) => c.id === user?.companyId);
  return (
    <span className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
      <Link href={`/profile/${userId}`} className="font-medium text-ink hover:text-burgundy">
        {company?.name ?? user?.name ?? "Unknown"}
      </Link>
      {company && <VerifiedBadge company={company} />}
      <span>· {at}</span>
    </span>
  );
}

export const topicName = (s: State, p: Post, lang: Lang) =>
  p.kind === "course" ? courseTitle(courses.find((c) => c.id === p.topicId), lang) : s.challenges.find((c) => c.id === p.topicId)?.title;

export const communityRules = "Be kind. Don't share challenge answers or private contact details like phone numbers and emails.";

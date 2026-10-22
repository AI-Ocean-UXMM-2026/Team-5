"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ReportButton } from "@/components/ui/ReportButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { canPostAsCompany, companyChallengeIds, hasContactDetails } from "@/lib/rules";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { newId, setState, today, useData } from "@/lib/store";
import type { Post } from "@/lib/types";
import { Author, communityRules, topicName } from "./Author";

const tabs = [
  ["all", "All"],
  ["course", "Course discussion"],
  ["challenge", "Challenge"],
] as const;

export default function Community() {
  const { s, me, company, lang } = useData();
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("all");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Post["kind"]>("course");
  const [topicId, setTopicId] = useState(courses[0].id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tried, setTried] = useState(false);

  const challengeIds = companyChallengeIds(company, s.challenges);
  const postingKind: Post["kind"] = tab === "challenge" ? "challenge" : tab === "course" ? "course" : kind;
  const topics =
    postingKind === "course"
      ? courses.map((c) => [c.id, courseTitle(c, lang)] as const)
      : s.challenges.filter((c) => challengeIds.includes(c.id)).map((c) => [c.id, c.title] as const);
  const selectedTopic = topics.some(([id]) => id === topicId) ? topicId : (topics[0]?.[0] ?? "");
  const showForm = postingKind === "course" ? me.role === "learner" || canPostAsCompany(company) : challengeIds.length > 0;
  const contactError = tried && hasContactDetails(`${title} ${body}`) ? "Remove phone numbers and email addresses. Keep contact on the platform." : undefined;
  const posts = s.posts
    .filter((p) => tab === "all" || p.kind === tab)
    .filter((p) => {
      if (p.kind !== "challenge") return true;
      const author = s.users.find((u) => u.id === p.authorId);
      return s.companies.find((c) => c.id === author?.companyId)?.status === "verified";
    })
    .filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q.trim().toLowerCase()))
    .toReversed();

  return (
    <>
      <PageHeader title="Community" intro="Free for everyone. Verified companies post about their own challenges. Ask a question in a reply, and submit your solution in Challenges." pose="love" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-wrap items-center justify-between gap-3 lg:col-start-1 lg:row-start-1">
          <div role="tablist" aria-label="Post type" className="flex gap-1">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${tab === id ? "bg-burgundy-tint text-burgundy" : "text-muted hover:bg-surface"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <SearchBar label="Search posts" placeholder="Search posts" value={q} onChange={setQ} />
        </div>
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2">
          {!posts.length && <Empty>No posts here yet.</Empty>}
          {posts.map((p) => (
            <Card key={p.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Author userId={p.authorId} at={p.at} />
                <Badge tone={p.kind === "challenge" ? "highlight" : "neutral"}>{topicName(s, p, lang)}</Badge>
              </div>
              <h2 className="text-h4">
                <Link href={`/community/${p.id}`} className="hover:text-burgundy">
                  {p.title}
                </Link>
              </h2>
              <p className="line-clamp-2 text-muted">{p.body}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1">
                  <LinkButton href={`/community/${p.id}#reply`} variant="tertiary">
                    Add comment
                  </LinkButton>
                  <LinkButton href={`/community/${p.id}`} variant="tertiary">
                    View replies
                  </LinkButton>
                </div>
                <ReportButton targetId={p.id} authorId={p.authorId} />
              </div>
            </Card>
          ))}
        </div>

        <Card className="self-start lg:col-start-2 lg:row-start-2">
          <h2 className="mb-1 text-h4">Start a discussion</h2>
          <p className="mb-4 text-body-sm text-muted">{communityRules}</p>
          {showForm ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!showForm || hasContactDetails(`${title} ${body}`)) return;
                if (postingKind === "challenge" && !challengeIds.includes(selectedTopic)) return;
                setState((st) => ({
                  ...st,
                  posts: [...st.posts, { id: newId("p"), authorId: me.id, kind: postingKind, topicId: selectedTopic, title: title.trim(), body: body.trim(), at: today(), replies: [] }],
                }));
                setTitle("");
                setBody("");
                setTried(false);
              }}
            >
              {tab === "all" && challengeIds.length > 0 && (
                <Select
                  label="Type"
                  value={kind}
                  onChange={(e) => {
                    const k = e.target.value as Post["kind"];
                    setKind(k);
                    setTopicId(k === "course" ? courses[0].id : (challengeIds[0] ?? ""));
                  }}
                >
                  <option value="course">Course discussion</option>
                  <option value="challenge">Challenge post</option>
                </Select>
              )}
              <Select label={postingKind === "course" ? "Course" : "Challenge"} value={selectedTopic} required onChange={(e) => setTopicId(e.target.value)}>
                {topics.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Select>
              <Input
                label="Title"
                required
                placeholder={postingKind === "challenge" ? "Notes, rules, or a question" : "What do you want to ask?"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                label="Message"
                required
                placeholder={postingKind === "challenge" ? "A short message for learners" : "A question about this course"}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                error={contactError}
              />
              <Button type="submit" className="self-start">
                Post
              </Button>
            </form>
          ) : (
            <p className="text-muted">
              {postingKind === "challenge"
                ? me.role === "learner"
                  ? "Only a verified company can post about its own challenge. Use Add comment to ask a question. Submit your solution in Challenges, not here."
                  : canPostAsCompany(company)
                    ? "Post a challenge first, then you can write about it here."
                    : "Only verified companies can post about a challenge."
                : "Only verified companies can post as a company."}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}

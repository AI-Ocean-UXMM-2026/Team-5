"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ReportButton } from "@/components/ui/ReportButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { canPostAsCompany, hasContactDetails } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { newId, setState, today, useData } from "@/lib/store";
import type { Post } from "@/lib/types";
import { Author, communityRules, topicName } from "./Author";

const tabs = [
  ["all", "All"],
  ["course", "Course discussion"],
  ["challenge", "Challenge questions"],
] as const;

export default function Community() {
  const { s, me, company } = useData();
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("all");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Post["kind"]>("course");
  const [topicId, setTopicId] = useState(courses[0].id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tried, setTried] = useState(false);

  const canPost = me.role === "learner" || canPostAsCompany(company);
  const contactError = tried && hasContactDetails(`${title} ${body}`) ? "Remove phone numbers and email addresses. Keep contact on the platform." : undefined;
  const topics = kind === "course" ? courses.map((c) => [c.id, c.title]) : s.challenges.map((c) => [c.id, c.title]);
  const posts = s.posts
    .filter((p) => tab === "all" || p.kind === tab)
    .filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q.trim().toLowerCase()))
    .toReversed();

  return (
    <>
      <PageHeader title="Community" intro="Free for everyone and moderated by our team. Verified companies answer challenge questions here." pose="love">
        <SearchBar label="Search posts" placeholder="Search posts" value={q} onChange={setQ} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
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
          {!posts.length && <Empty>No posts here yet.</Empty>}
          {posts.map((p) => (
            <Card key={p.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Author userId={p.authorId} at={p.at} />
                <Badge tone={p.kind === "challenge" ? "highlight" : "neutral"}>{topicName(s, p)}</Badge>
              </div>
              <h2 className="text-h4">
                <Link href={`/community/${p.id}`} className="hover:text-burgundy">
                  {p.title}
                </Link>
              </h2>
              <p className="line-clamp-2 text-muted">{p.body}</p>
              <div className="flex items-center justify-between pt-1 text-body-sm text-muted">
                <span>
                  {p.replies.length} {p.replies.length === 1 ? "reply" : "replies"}
                </span>
                <ReportButton targetId={p.id} authorId={p.authorId} />
              </div>
            </Card>
          ))}
        </div>

        <Card className="self-start">
          <h2 className="mb-1 text-h4">Start a discussion</h2>
          <p className="mb-4 text-body-sm text-muted">{communityRules}</p>
          {canPost ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (hasContactDetails(`${title} ${body}`)) return;
                setState((st) => ({ ...st, posts: [...st.posts, { id: newId("p"), authorId: me.id, kind, topicId, title: title.trim(), body: body.trim(), at: today(), replies: [] }] }));
                setTitle("");
                setBody("");
                setTried(false);
              }}
            >
              <Select
                label="Type"
                value={kind}
                onChange={(e) => {
                  const k = e.target.value as Post["kind"];
                  setKind(k);
                  setTopicId(k === "course" ? courses[0].id : (s.challenges[0]?.id ?? ""));
                }}
              >
                <option value="course">Course discussion</option>
                <option value="challenge">Challenge question</option>
              </Select>
              <Select label={kind === "course" ? "Course" : "Challenge"} value={topicId} required onChange={(e) => setTopicId(e.target.value)}>
                {topics.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Select>
              <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea label="Message" required value={body} onChange={(e) => setBody(e.target.value)} error={contactError} />
              <Button type="submit" className="self-start">
                Post
              </Button>
            </form>
          ) : (
            <p className="text-muted">Only verified companies can post as a company.</p>
          )}
        </Card>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { ReportButton } from "@/components/ui/ReportButton";
import { hasContactDetails } from "@/lib/rules";
import { newId, setState, today, useData } from "@/lib/store";
import { Author, communityRules, topicName } from "../Author";

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { s, me } = useData();
  const [reply, setReply] = useState("");
  const [tried, setTried] = useState(false);
  const post = s.posts.find((p) => p.id === postId);
  if (!post) return <Empty>Post not found.</Empty>;

  const contactError = tried && hasContactDetails(reply) ? "Remove phone numbers and email addresses. Keep contact on the platform." : undefined;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link href="/community" className="text-body-sm text-muted hover:text-burgundy">
        ← Community
      </Link>
      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Author userId={post.authorId} at={post.at} />
          <Badge tone={post.kind === "challenge" ? "highlight" : "neutral"}>{topicName(s, post)}</Badge>
        </div>
        <h1 className="text-h2">{post.title}</h1>
        <p className="whitespace-pre-wrap text-body-lg">{post.body}</p>
        <div className="flex justify-end">
          <ReportButton targetId={post.id} authorId={post.authorId} />
        </div>
      </Card>

      <h2 className="mt-4 text-h4">
        {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
      </h2>
      {post.replies.map((r) => (
        <Card key={r.id} className="flex flex-col gap-2">
          <Author userId={r.authorId} at={r.at} />
          <p className="whitespace-pre-wrap">{r.body}</p>
          <div className="flex justify-end">
            <ReportButton targetId={r.id} authorId={r.authorId} label="reply" />
          </div>
        </Card>
      ))}

      <Card>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (hasContactDetails(reply)) return;
            setState((st) => ({
              ...st,
              posts: st.posts.map((p) => (p.id === post.id ? { ...p, replies: [...p.replies, { id: newId("r"), authorId: me.id, body: reply.trim(), at: today() }] } : p)),
            }));
            setReply("");
            setTried(false);
          }}
        >
          <Textarea label="Write a reply" hint={communityRules} required value={reply} onChange={(e) => setReply(e.target.value)} error={contactError} className="min-h-24" />
          <Button type="submit" className="self-start">
            Reply
          </Button>
        </form>
      </Card>
    </div>
  );
}

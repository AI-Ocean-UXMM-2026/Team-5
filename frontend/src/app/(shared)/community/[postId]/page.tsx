"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { ReportButton } from "@/components/ui/ReportButton";
import { hasContactDetails } from "@/lib/rules";
import { newId, setState, today, useData } from "@/lib/store";
import { Author, communityRules, topicName } from "../Author";

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { s, me, company, lang } = useData();
  const [reply, setReply] = useState("");
  const [tried, setTried] = useState(false);
  const post = s.posts.find((p) => p.id === postId);

  useEffect(() => {
    if (window.location.hash === "#reply") document.querySelector<HTMLTextAreaElement>("#reply textarea")?.focus();
  }, [postId]);

  const crumbs = [
    { label: "Community", href: "/community" },
    { label: post?.title ?? "Post" },
  ];
  if (!post) return (
    <>
      <Breadcrumb items={crumbs} />
      <Empty>Post not found.</Empty>
    </>
  );

  const contactError = tried && hasContactDetails(reply) ? "Remove phone numbers and email addresses. Keep contact on the platform." : undefined;
  const ownsChallenge = post.kind === "challenge" && company?.status === "verified" && s.challenges.some((c) => c.id === post.topicId && c.companyId === company.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Breadcrumb items={crumbs} />
      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Author userId={post.authorId} at={post.at} />
          <Badge tone={post.kind === "challenge" ? "highlight" : "neutral"}>{topicName(s, post, lang)}</Badge>
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
      {[...post.replies]
        .sort((a, b) => Number(b.id === post.officialReplyId) - Number(a.id === post.officialReplyId))
        .map((r) => {
          const official = r.id === post.officialReplyId;
          return (
            <Card key={r.id} tone={official ? "success" : "default"} className="flex flex-col gap-2">
              <Author userId={r.authorId} at={r.at} />
              <p className="whitespace-pre-wrap">{r.body}</p>
              <div className="flex items-center justify-between gap-2">
                {official ? (
                  <Badge tone="success">Official answer</Badge>
                ) : ownsChallenge && r.authorId === me.id ? (
                  <button
                    type="button"
                    onClick={() => setState((st) => ({ ...st, posts: st.posts.map((p) => (p.id === post.id ? { ...p, officialReplyId: r.id } : p)) }))}
                    className="text-body-sm font-medium text-burgundy"
                  >
                    Mark as official answer
                  </button>
                ) : (
                  <span />
                )}
                <ReportButton targetId={r.id} authorId={r.authorId} label="reply" />
              </div>
            </Card>
          );
        })}

      <Card id="reply" className="scroll-mt-8">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (hasContactDetails(reply)) return;
            const replyId = newId("r");
            setState((st) => ({
              ...st,
              posts: st.posts.map((p) =>
                p.id === post.id
                  ? { ...p, replies: [...p.replies, { id: replyId, authorId: me.id, body: reply.trim(), at: today() }], officialReplyId: ownsChallenge ? replyId : p.officialReplyId }
                  : p,
              ),
            }));
            setReply("");
            setTried(false);
          }}
        >
          <Textarea
            label="Write a reply"
            hint={
              post.kind === "challenge" && me.role === "learner"
                ? "Ask a question or leave a comment. Submit your solution in Challenges, not here."
                : ownsChallenge
                  ? "Your reply is marked as the official answer."
                  : communityRules
            }
            required
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            error={contactError}
            className="min-h-24"
          />
          <Button type="submit" className="self-start">
            Reply
          </Button>
        </form>
      </Card>
    </div>
  );
}

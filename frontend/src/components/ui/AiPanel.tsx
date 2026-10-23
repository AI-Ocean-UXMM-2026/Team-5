const panelTone = {
  ai: { box: "border-ai-line bg-ai", badge: "bg-ai-ink", title: "text-ai-ink" },
  yellow: { box: "border-yellow bg-yellow-tint", badge: "bg-ink", title: "text-ink" },
  secondary: { box: "border-line bg-white", badge: "bg-ink", title: "text-ink" },
};

export function AiPanel({ title, loading, tone = "ai", children }: { title: string; loading?: boolean; tone?: keyof typeof panelTone; children?: React.ReactNode }) {
  const look = panelTone[tone];
  return (
    <section className={`h-fit rounded-2xl border p-5 text-ink ${look.box}`} aria-busy={loading}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white ${look.badge}`}>AI</span>
        <h2 className={`text-body-lg ${look.title}`}>{title}</h2>
      </div>
      <div aria-live="polite">{loading ? <p className="text-muted">Thinking…</p> : children}</div>
      <p className="mt-3 text-caption text-muted">AI can be wrong. Check it before you rely on it.</p>
    </section>
  );
}

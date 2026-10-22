export function AiPanel({ title, loading, tone = "ai", children }: { title: string; loading?: boolean; tone?: "ai" | "yellow"; children?: React.ReactNode }) {
  const yellow = tone === "yellow";
  return (
    <section className={`h-fit rounded-2xl border p-5 text-ink ${yellow ? "border-yellow bg-yellow-tint" : "border-ai-line bg-ai"}`} aria-busy={loading}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white ${yellow ? "bg-ink" : "bg-ai-ink"}`}>AI</span>
        <h2 className={`text-body-lg ${yellow ? "text-ink" : "text-ai-ink"}`}>{title}</h2>
      </div>
      <div aria-live="polite">{loading ? <p className="text-muted">Thinking…</p> : children}</div>
      <p className="mt-3 text-caption text-muted">AI can be wrong. Check it before you rely on it.</p>
    </section>
  );
}

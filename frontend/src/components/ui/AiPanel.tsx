export function AiPanel({ title, loading, children }: { title: string; loading?: boolean; children?: React.ReactNode }) {
  return (
    <section className="h-fit rounded-2xl border border-ai-line bg-ai p-5 text-ink" aria-busy={loading}>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-ai-ink px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">AI</span>
        <h2 className="text-body-lg text-ai-ink">{title}</h2>
      </div>
      <div aria-live="polite">{loading ? <p className="text-muted">Thinking…</p> : children}</div>
      <p className="mt-3 text-caption text-muted">AI can be wrong. Check it before you rely on it.</p>
    </section>
  );
}

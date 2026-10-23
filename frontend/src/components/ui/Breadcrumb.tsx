import Link from "next/link";

type Crumb = { label: string; href?: string; onClick?: () => void };

export function Breadcrumb({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-body-sm">
        {items.flatMap((item, i) => {
          const last = i === items.length - 1;
          const crumb = (
            <li key={i} aria-current={last ? "page" : undefined} className={last ? "font-medium" : undefined}>
              {last ? (
                item.label
              ) : item.href ? (
                <Link href={item.href} className="text-muted hover:text-burgundy">
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick} className="text-muted hover:text-burgundy">
                  {item.label}
                </button>
              )}
            </li>
          );
          if (i === 0) return [crumb];
          return [
            <li key={`sep-${i}`} aria-hidden className="text-subtle">
              /
            </li>,
            crumb,
          ];
        })}
      </ol>
    </nav>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="-ml-2 mb-4 inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}

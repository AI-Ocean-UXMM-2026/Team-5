import type { ComponentProps } from "react";
import { Mascot, type Pose } from "./Mascot";

const cardTones = {
  default: "border-line bg-white",
  success: "border-success bg-success-tint",
  danger: "border-danger bg-danger-tint",
  highlight: "border-yellow bg-yellow-tint",
  dashed: "border-dashed border-line bg-white",
};

export const cardLinkClass =
  "group relative cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-burgundy focus-within:ring-offset-2";

export const cardLinkStretch = "after:absolute after:inset-0 after:rounded-2xl focus:outline-none";

export function Card({ tone = "default", className = "", ...props }: ComponentProps<"section"> & { tone?: keyof typeof cardTones }) {
  return <section className={`rounded-2xl border p-5 sm:p-6 ${cardTones[tone]} ${className}`} {...props} />;
}

const tones = {
  neutral: "bg-surface text-muted",
  brand: "bg-burgundy-tint text-burgundy",
  primary: "bg-burgundy-300 text-ink",
  highlight: "bg-yellow-tint text-ink",
  success: "bg-success-tint text-success",
  danger: "bg-danger-tint text-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-caption font-medium ${tones[tone]}`}>{children}</span>;
}

export { LockIcon } from "./LockIcon";

/** The one page header used across the signed-in app: title, optional intro and actions. The breadcrumb lives in the top bar. */
export function PageHeader({ title, intro, media, badge, children }: { title: string; intro?: string; pose?: Pose; media?: React.ReactNode; badge?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        {media}
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-3 text-h3 tracking-[-0.02em] sm:text-h2">
            {title}
            {badge}
          </h1>
          {intro && <p className="mt-1.5 max-w-2xl text-body text-muted">{intro}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ pose = "peek", action, children }: { pose?: Pose; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
      <Mascot pose={pose} size={120} />
      <p>{children}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

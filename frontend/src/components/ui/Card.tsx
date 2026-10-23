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

export function LockIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function PageHeader({ title, intro, pose, media, badge, children }: { title: string; intro?: string; pose?: Pose; media?: React.ReactNode; badge?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {media ?? (pose ? <Mascot pose={pose} size={88} className="hidden sm:block" priority /> : null)}
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-h2 sm:text-h1">
            {title}
            {badge}
          </h1>
          {intro && <p className="mt-2 max-w-2xl text-body-lg text-muted">{intro}</p>}
        </div>
      </div>
      {children}
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

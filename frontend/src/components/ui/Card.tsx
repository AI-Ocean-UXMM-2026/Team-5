import type { ComponentProps } from "react";
import { Mascot, type Pose } from "./Mascot";

const cardTones = {
  default: "border-line bg-white",
  success: "border-success bg-success-tint",
  danger: "border-danger bg-danger-tint",
  highlight: "border-yellow bg-yellow-tint",
  dashed: "border-dashed border-line bg-white",
};

export function Card({ tone = "default", className = "", ...props }: ComponentProps<"section"> & { tone?: keyof typeof cardTones }) {
  return <section className={`rounded-2xl border p-5 sm:p-6 ${cardTones[tone]} ${className}`} {...props} />;
}

const tones = {
  neutral: "bg-surface text-muted",
  brand: "bg-burgundy-tint text-burgundy",
  highlight: "bg-yellow-tint text-ink",
  success: "bg-success-tint text-success",
  danger: "bg-danger-tint text-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-caption font-medium ${tones[tone]}`}>{children}</span>;
}

export function PageHeader({ title, intro, pose, children }: { title: string; intro?: string; pose?: Pose; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {pose && <Mascot pose={pose} size={88} className="hidden sm:block" priority />}
        <div>
          <h1 className="text-h2 sm:text-h1">{title}</h1>
          {intro && <p className="mt-2 max-w-2xl text-body-lg text-muted">{intro}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Empty({ pose = "peek", children }: { pose?: Pose; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
      <Mascot pose={pose} size={120} />
      <p>{children}</p>
    </div>
  );
}

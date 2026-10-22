import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-burgundy text-white hover:bg-burgundy-dark",
  secondary: "bg-white text-ink border border-line hover:bg-surface",
  tertiary: "text-burgundy hover:bg-burgundy-tint",
};

type Variant = keyof typeof variants;

const base =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-disabled disabled:text-subtle disabled:border-line pointer-coarse:h-11";

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkArrow({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 11 11 5M6.5 5H11v4.5" />
    </svg>
  );
}

export function LinkButton({ variant = "primary", className = "", children, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      <LinkArrow />
    </Link>
  );
}

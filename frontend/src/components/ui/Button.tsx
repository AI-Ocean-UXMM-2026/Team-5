import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-burgundy text-white hover:bg-burgundy-dark",
  secondary: "bg-white text-ink border border-line hover:bg-surface",
  tertiary: "text-burgundy hover:bg-burgundy-tint",
  danger: "bg-danger text-white hover:bg-[#912018]",
};

type Variant = keyof typeof variants;

const base =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-disabled disabled:text-subtle disabled:border-line pointer-coarse:h-11";

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type ComponentProps, type ReactNode } from "react";
import { setState, useData } from "@/lib/store";
import "./auth.css";

export type AuthIconName =
  | "mail"
  | "user"
  | "graduate"
  | "briefcase"
  | "code"
  | "server"
  | "layers"
  | "pen"
  | "chart"
  | "compass"
  | "arrow"
  | "back"
  | "check"
  | "info"
  | "clock"
  | "spark"
  | "globe";
export function AuthIcon({
  name,
  size = 21,
}: {
  name: AuthIconName;
  size?: number;
}) {
  const paths: Record<AuthIconName, ReactNode> = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
      </>
    ),
    graduate: (
      <>
        <path d="m2 9 10-5 10 5-10 5Z" />
        <path d="M6 11v6l6 3 6-3v-6m4-2v8" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V3h8v4M3 12c6 4 12 4 18 0m-9 0v5" />
      </>
    ),
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18" />,
    server: (
      <>
        <rect x="3" y="3" width="18" height="7" rx="2" />
        <rect x="3" y="14" width="18" height="7" rx="2" />
        <path d="M7 6h1m-1 11h1m5-11h4m-4 11h4" />
      </>
    ),
    layers: (
      <>
        <path d="m2 8 10-5 10 5-10 5Zm0 5 10 5 10-5M2 18l10 5 10-5" />
      </>
    ),
    pen: (
      <>
        <path d="m4 17 12-12 4 4L8 21H4Zm10-10 4 4M4 3h5M4 3v5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 21V11h4v10m3 0V4h4v17m3 0V8h4v13" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-3 5-5 3 3-5Z" />
      </>
    ),
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    back: <path d="M20 12H5m6-6-6 6 6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

export function AuthFrame({
  children,
  variant = "standard",
}: {
  children: ReactNode;
  variant?: "standard" | "signup" | "onboarding" | "review";
}) {
  const { lang } = useData();
  return (
    <div className="ca-root">
      <a className="ca-skip" href="#auth-content">
        Skip to content
      </a>
      <header className="ca-header">
        <Link href="/" className="ca-brand" aria-label="The Citadel home">
          <Image
            src="/logo/the-citadel-icon-primary.png"
            alt=""
            width={40}
            height={40}
          />
          <span>the citadel</span>
        </Link>
        <div role="group" aria-label="Language" className="ca-language">
          {(
            [
              ["en", "EN"],
              ["my", "မြန်မာ"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={lang === id}
              onClick={() => setState((st) => ({ ...st, lang: id }))}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <main id="auth-content" className={`ca-main ca-${variant}`}>
        {children}
      </main>
    </div>
  );
}

export function AuthInput({
  label,
  icon,
  hint,
  error,
  className = "",
  ...props
}: ComponentProps<"input"> & {
  label: string;
  icon?: AuthIconName;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div className={`ca-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className={`ca-inputWrap ${error ? "ca-invalid" : ""}`}>
        {icon && <AuthIcon name={icon} size={19} />}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
      </div>
      {error ? (
        <p className="ca-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="ca-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
export function AuthButton({
  children,
  secondary = false,
  back = false,
  ...props
}: ComponentProps<"button"> & { secondary?: boolean; back?: boolean }) {
  return (
    <button
      type="button"
      className={`ca-button ${secondary ? "ca-secondary" : "ca-primary"}`}
      {...props}
    >
      {back && <AuthIcon name="back" size={18} />}
      <span>{children}</span>
      {!secondary && <AuthIcon name="arrow" size={20} />}
    </button>
  );
}
export function AuthNote({ children }: { children: ReactNode }) {
  return (
    <p className="ca-note">
      <AuthIcon name="info" size={16} />
      <span>{children}</span>
    </p>
  );
}

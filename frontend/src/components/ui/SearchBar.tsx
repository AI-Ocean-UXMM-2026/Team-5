"use client";

import { useRef } from "react";

export function SearchBar({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      role="search"
      onClick={() => input.current?.focus()}
      className="flex h-10 w-full max-w-[360px] items-center gap-2.5 rounded-xl border border-line bg-white px-3 hover:border-subtle focus-within:border-burgundy focus-within:shadow-[0_0_0_4px_rgb(150_61_80/20%)] sm:w-[280px]"
    >
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={input}
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:shadow-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <>
          <span aria-hidden className="h-5 w-px bg-line" />
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange("");
              input.current?.focus();
            }}
            className="text-muted hover:text-ink"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}

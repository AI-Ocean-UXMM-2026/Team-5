"use client";

import { useEffect, useRef, useState } from "react";
import { googleSession, type GoogleAccount } from "@/lib/google-session";
import { setState } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type GoogleId = {
  initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve();
  const src = "https://accounts.google.com/gsi/client?hl=en";
  return new Promise<void>((resolve, reject) => {
    const found = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = found || document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Google sign-in did not load.")), { once: true });
    if (!found) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export function GoogleSignIn() {
  const slot = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const configRes = await fetch(`${API}/auth/google/client`);
        const config = await configRes.json();
        if (!configRes.ok) throw new Error(config.error || "Google sign-in is not configured.");
        await loadGoogle();
        if (gone || !slot.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: config.clientId,
          callback: async (response) => {
            if (!response.credential) {
              setError("Google did not return a sign-in token.");
              return;
            }
            try {
              const res = await fetch(`${API}/auth/google`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: response.credential }),
              });
              const body = await res.json();
              if (!res.ok) throw new Error(body.error || "Google sign-in failed.");
              setState((state) => googleSession(state, body.user as GoogleAccount));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Google sign-in failed.");
            }
          },
        });
        const width = Math.max(240, Math.min(400, slot.current.offsetWidth || 320));
        window.google.accounts.id.renderButton(slot.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
        });
      } catch (err) {
        if (!gone) setError(err instanceof Error ? err.message : "Google sign-in is not configured.");
      }
    })();
    return () => {
      gone = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div ref={slot} className="flex min-h-10 justify-center" />
      {error ? <p className="text-body-sm text-danger">{error}</p> : null}
    </div>
  );
}

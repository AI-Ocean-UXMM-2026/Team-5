"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import {
  AuthButton,
  AuthFrame,
  AuthInput,
  AuthNote,
} from "@/components/auth/AuthFrame";
import { Mascot } from "@/components/ui/Mascot";
import { setState, useData } from "@/lib/store";

export default function Login() {
  const { s, lang } = useData();
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthFrame>
      <div className="ca-loginArtwork">
        <Mascot pose="peek" size={340} priority />
        <span className="ca-star" aria-hidden>
          ✦
        </span>
        <span className="ca-peekLine" />
      </div>
      <div className="ca-heading ca-centered">
        <h1>
          {x("Welcome back", "ပြန်လည်ကြိုဆိုပါတယ်")}
          <em>.</em>
        </h1>
        <p>
          {x("Pick up where you left off.", "ရပ်ထားခဲ့သည့်နေရာမှ ဆက်လေ့လာပါ။")}
        </p>
      </div>
      <form
        className="ca-form ca-loginForm"
        onSubmit={(e) => {
          e.preventDefault();
          const user = s.users.find(
            (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
          );
          if (user) setState((st) => ({ ...st, sessionUserId: user.id }));
          else
            setError(
              x(
                "No account with this email. Check it, or create an account.",
                "ဤအီးမေးလ်ဖြင့် အကောင့်မရှိပါ။ ပြန်စစ်ပါ သို့မဟုတ် အကောင့်ဖန်တီးပါ။",
              ),
            );
        }}
      >
        <AuthInput
          label={x("Email address", "အီးမေးလ်လိပ်စာ")}
          type="email"
          icon="mail"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
        />
        <AuthButton type="submit">{x("Continue", "ဆက်သွားမယ်")}</AuthButton>
      </form>
      <p className="ca-switch">{x("or", "သို့မဟုတ်")}</p>
      <GoogleSignIn />
      <p className="ca-switch">
        {x("New here?", "အသစ်လား။")}{" "}
        <Link href="/signup">{x("Create an account", "အကောင့်ဖန်တီးပါ")}</Link>
      </p>
      <div className="ca-loginFoot">
        <AuthNote>
          {x(
            "Demo access · no password required.",
            "နမူနာအသုံးပြုမှု · စကားဝှက်မလိုအပ်ပါ။",
          )}
        </AuthNote>
      </div>
    </AuthFrame>
  );
}

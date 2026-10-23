"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import {
  AuthButton,
  AuthFrame,
  AuthIcon,
  AuthInput,
  AuthNote,
} from "@/components/auth/AuthFrame";
import { Mascot } from "@/components/ui/Mascot";
import { copy } from "@/lib/i18n";
import { setState, useData } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function Login() {
  const { s, lang } = useData();
  const t = copy[lang];
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const preset =
    useSearchParams().get("role") === "company" ? "company" : "learner";
  const [role, setRole] = useState<Role>(preset);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const company = role === "company";
  const logIn = (id: string) => setState((st) => ({ ...st, sessionUserId: id }));
  // Demo accounts have no passwords, so each role lists its accounts to sign in with one tap.
  const demoAccounts = s.users.filter((u) => u.role === role);

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
          {company
            ? x("Review challenge work and meet your next intern.", "စိန်ခေါ်မှုအဖြေများ စစ်ပြီး အလုပ်သင်အသစ်နှင့် တွေ့ပါ။")
            : x("Pick up where you left off.", "ရပ်ထားခဲ့သည့်နေရာမှ ဆက်လေ့လာပါ။")}
        </p>
      </div>
      <form
        className="ca-form ca-loginForm"
        onSubmit={(e) => {
          e.preventDefault();
          const user = s.users.find(
            (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
          );
          if (!user)
            setError(
              company
                ? x(
                    "No company account with this email. Use the work email you registered with, or register your company.",
                    "ဤအီးမေးလ်ဖြင့် ကုမ္ပဏီအကောင့်မရှိပါ။ မှတ်ပုံတင်ခဲ့သည့် အလုပ်အီးမေးလ်ကို သုံးပါ သို့မဟုတ် ကုမ္ပဏီ မှတ်ပုံတင်ပါ။",
                  )
                : x(
                    "No account with this email. Check it, or create an account.",
                    "ဤအီးမေးလ်ဖြင့် အကောင့်မရှိပါ။ ပြန်စစ်ပါ သို့မဟုတ် အကောင့်ဖန်တီးပါ။",
                  ),
            );
          else if (user.role !== role)
            setError(
              user.role === "company"
                ? x("This is a company account. Choose Company above to log in.", "ဤသည် ကုမ္ပဏီအကောင့်ဖြစ်သည်။ အပေါ်ရှိ ကုမ္ပဏီကို ရွေးပါ။")
                : x("This is a learner account. Choose Learner above to log in.", "ဤသည် သင်ယူသူအကောင့်ဖြစ်သည်။ အပေါ်ရှိ သင်ယူသူကို ရွေးပါ။"),
            );
          else logIn(user.id);
        }}
      >
        <fieldset className="ca-roleField">
          <legend className="ca-srOnly">{t.iAm}</legend>
          <div className="ca-roleChoices">
            {(
              [
                { value: "learner", label: t.learner, description: x("Continue learning", "ဆက်လေ့လာပါ"), icon: "graduate" },
                { value: "company", label: t.company, description: x("Manage challenges and hiring", "စိန်ခေါ်မှုနှင့် ခန့်အပ်မှု စီမံပါ"), icon: "briefcase" },
              ] as const
            ).map((item) => (
              <label key={item.value} className={`ca-roleChoice ${role === item.value ? "ca-selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value={item.value}
                  checked={role === item.value}
                  onChange={() => {
                    setRole(item.value);
                    setError("");
                  }}
                />
                <AuthIcon name={item.icon} size={30} />
                <span className="ca-choiceRadio" aria-hidden />
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <AuthInput
          label={company ? x("Work email", "အလုပ်အီးမေးလ်") : x("Email address", "အီးမေးလ်လိပ်စာ")}
          type="email"
          icon="mail"
          placeholder={company ? "hr@company.com" : "you@example.com"}
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
          hint={company ? x("The email you registered your company with.", "ကုမ္ပဏီ မှတ်ပုံတင်စဉ်က သုံးခဲ့သည့် အီးမေးလ်။") : undefined}
        />
        <AuthButton type="submit">{x("Continue", "ဆက်သွားမယ်")}</AuthButton>
      </form>
      {/* Google sign-in makes learner accounts; companies sign in with their verified work email. */}
      {!company && (
        <>
          <p className="ca-switch">{x("or", "သို့မဟုတ်")}</p>
          <GoogleSignIn />
        </>
      )}
      <p className="ca-switch">
        {company ? x("Not registered yet?", "မှတ်ပုံမတင်ရသေးဘူးလား။") : x("New here?", "အသစ်လား။")}{" "}
        <Link href={company ? "/signup?role=company" : "/signup"}>
          {company ? x("Register your company", "ကုမ္ပဏီ မှတ်ပုံတင်ပါ") : x("Create an account", "အကောင့်ဖန်တီးပါ")}
        </Link>
      </p>
      <div className="ca-loginFoot">
        <AuthNote>
          {x(
            "Demo access · no password required.",
            "နမူနာအသုံးပြုမှု · စကားဝှက်မလိုအပ်ပါ။",
          )}
        </AuthNote>
        {demoAccounts.length > 0 && (
          <ul className="ca-demoAccounts" aria-label={x("Demo accounts", "နမူနာအကောင့်များ")}>
            {demoAccounts.map((u) => {
              const status = s.companies.find((c) => c.id === u.companyId)?.status;
              return (
                <li key={u.id}>
                  <button type="button" onClick={() => logIn(u.id)}>
                    <strong>{u.name}</strong>
                    <small>
                      {u.email}
                      {company && (status === "verified" ? x(" · Verified", " · အတည်ပြုပြီး") : x(" · Not verified yet", " · မအတည်ပြုရသေး"))}
                    </small>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AuthFrame>
  );
}

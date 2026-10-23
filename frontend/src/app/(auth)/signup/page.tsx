"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AuthButton,
  AuthFrame,
  AuthIcon,
  AuthInput,
  AuthNote,
} from "@/components/auth/AuthFrame";
import { Mascot } from "@/components/ui/Mascot";
import { copy } from "@/lib/i18n";
import { newId, setState, today, useData } from "@/lib/store";
import type { Role } from "@/lib/types";

// shortcut: the demo shows the code on screen; the backend will email it and check it server-side.
const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

export default function Signup() {
  const { s, lang } = useData();
  const t = copy[lang];
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const preset =
    useSearchParams().get("role") === "company" ? "company" : "learner";
  const [role, setRole] = useState<Role>(preset);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState("");
  const [entered, setEntered] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resent, setResent] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const confirming = code !== "";
  const taken = s.users.some(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );

  useEffect(() => {
    heading.current?.focus();
  }, [confirming]);

  const createAccount = () => {
    const userId = newId("u");
    const companyId = role === "company" ? newId("c") : undefined;
    setState((st) => ({
      ...st,
      sessionUserId: userId,
      users: [
        ...st.users,
        {
          id: userId,
          role,
          name: name.trim(),
          email: email.trim(),
          headline: "",
          skills: [],
          companyId,
          acceptedTermsAt: today(),
        },
      ],
      companies: companyId
        ? [
            ...st.companies,
            {
              id: companyId,
              name: companyName.trim(),
              about: "",
              website: "",
              social: "",
              address: "",
              phone: "",
              email: email.trim(),
              documents: [],
              terms: { role: "", duration: "", location: "", stipend: "" },
              status: "draft",
            },
          ]
        : st.companies,
    }));
  };

  if (confirming)
    return (
      <AuthFrame>
        <div className="ca-verificationMascot">
          <Mascot pose="laptop" size={130} priority />
        </div>
        <div className="ca-heading ca-centered">
          <h1 ref={heading} tabIndex={-1}>
            {x("Check your inbox", "သင့်အီးမေးလ်ကို စစ်ပါ")}
            <em>.</em>
          </h1>
          <p>
            {t.confirmIntro}
            <br />
            <strong className="ca-emailHighlight">{email.trim()}</strong>
          </p>
        </div>
        <form
          className="ca-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (entered.trim() !== code) return setCodeError(t.wrongCode);
            createAccount();
          }}
        >
          <AuthInput
            label={t.codeLabel}
            icon="mail"
            inputMode="numeric"
            pattern="[0-9]{6}"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={entered}
            placeholder="000000"
            className="ca-codeField"
            onChange={(e) => {
              setEntered(e.target.value.replace(/\D/g, ""));
              setCodeError("");
            }}
            error={codeError}
          />
          <div className="ca-demoCode">
            <AuthIcon name="info" size={16} />
            <span>
              {t.demoCode} <strong>{code}</strong>
            </span>
          </div>
          <AuthButton type="submit">{t.confirmEmail}</AuthButton>
        </form>
        <div className="ca-resend">
          <button
            onClick={() => {
              setCode(newCode());
              setEntered("");
              setCodeError("");
              setResent(true);
            }}
          >
            {t.resendCode}
          </button>
          <button
            onClick={() => {
              setCode("");
              setEntered("");
              setResent(false);
            }}
          >
            {t.changeEmail}
          </button>
        </div>
        <p className="ca-resendStatus" role="status">
          {resent ? t.codeResent : ""}
        </p>
        <AuthNote>
          {x(
            "This prototype shows the code here instead of sending an email.",
            "ဤနမူနာတွင် အီးမေးလ်ပို့မည့်အစား ကုဒ်ကို ဒီမှာဖော်ပြထားသည်။",
          )}
        </AuthNote>
      </AuthFrame>
    );

  return (
    <AuthFrame variant="signup">
      <div className="ca-heading ca-centered">
        <h1 ref={heading} tabIndex={-1}>
          {x("Your next chapter", "သင့်အခွင့်အလမ်းအသစ်ကို")}
          <br />
          {x("starts ", "ဒီမှာ ")}
          <em>{x("here.", "စတင်ပါ။")}</em>
        </h1>
        <p>
          {x(
            "Join learners and companies building Myanmar's tech talent.",
            "မြန်မာ့နည်းပညာစွမ်းရည်ကို တည်ဆောက်နေသော လေ့လာသူများနှင့် ကုမ္ပဏီများတွင် ပါဝင်ပါ။",
          )}
        </p>
      </div>
      <form
        className="ca-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (taken || !agreed) return;
          setCode(newCode());
        }}
      >
        <fieldset className="ca-roleField">
          <legend className="ca-srOnly">{t.iAm}</legend>
          <div className="ca-roleChoices">
            {(
              [
                {
                  value: "learner",
                  label: t.learner,
                  description: x(
                    "Build your career",
                    "သင့်အလုပ်အကိုင်တည်ဆောက်ပါ",
                  ),
                  icon: "graduate",
                },
                {
                  value: "company",
                  label: t.company,
                  description: x(
                    "Find emerging talent",
                    "မျိုးဆက်သစ်ပညာရှင် ရှာပါ",
                  ),
                  icon: "briefcase",
                },
              ] as const
            ).map((item) => (
              <label
                key={item.value}
                className={`ca-roleChoice ${role === item.value ? "ca-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={item.value}
                  checked={role === item.value}
                  onChange={() => setRole(item.value)}
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
          label={t.yourName}
          icon="user"
          placeholder={x("Your full name", "သင့်အမည်အပြည့်အစုံ")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        {role === "company" && (
          <AuthInput
            label={t.companyName}
            icon="briefcase"
            placeholder={t.companyPlaceholder}
            required
            value={companyName}
            autoComplete="organization"
            onChange={(e) => setCompanyName(e.target.value)}
          />
        )}
        <AuthInput
          label={x("Email address", "အီးမေးလ်လိပ်စာ")}
          icon="mail"
          type="email"
          placeholder={
            role === "company" ? "hr@company.com" : "you@example.com"
          }
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={taken ? t.emailTaken : undefined}
          hint={role === "company" ? t.emailHint : undefined}
        />
        <label className="ca-terms">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            {x("I agree to the ", "သဘောတူပါသည် — ")}
            <Link href="/legal#terms" target="_blank">
              {x("Terms", "စည်းကမ်းချက်များ")}
            </Link>
            {x(" and ", " နှင့် ")}
            <Link href="/legal#privacy" target="_blank">
              {x("Privacy Policy", "ကိုယ်ရေးလုံခြုံမှုမူဝါဒ")}
            </Link>
            .
          </span>
        </label>
        <AuthButton type="submit">
          {x("Continue with email", "အီးမေးလ်ဖြင့် ဆက်သွားမယ်")}
        </AuthButton>
      </form>
      <p className="ca-switch">
        {x("Already have an account?", "အကောင့်ရှိပြီးပြီလား။")}{" "}
        <Link href={role === "company" ? "/login?role=company" : "/login"}>{x("Sign in", "ဝင်ရန်")}</Link>
      </p>
      <AuthNote>
        {x("Verify your email next.", "နောက်တစ်ဆင့်တွင် အီးမေးလ်အတည်ပြုပါ။")}
      </AuthNote>
      <Image
        src="/images/auth/signup-journey.webp"
        alt=""
        width={1536}
        height={512}
        sizes="(max-width:700px) 100vw, 550px"
        className="ca-signupArtwork"
      />
    </AuthFrame>
  );
}

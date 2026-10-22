"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { copy } from "@/lib/i18n";
import { newId, setState, useData } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function Signup() {
  const { s, lang } = useData();
  const t = copy[lang];
  const preset = useSearchParams().get("role") === "company" ? "company" : "learner";
  const [role, setRole] = useState<Role>(preset);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const taken = s.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  return (
    <Card className="mx-auto max-w-lg">
      <Mascot pose="hello" size={96} priority className="-mt-2 mb-2" />
      <h1 className="text-h2">{t.signupTitle}</h1>
      <p className="mt-1 mb-6 text-muted">{role === "company" ? t.signupCompany : t.signupIntro}</p>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (taken) return;
          const userId = newId("u");
          const companyId = role === "company" ? newId("c") : undefined;
          setState((st) => ({
            ...st,
            sessionUserId: userId,
            users: [...st.users, { id: userId, role, name: name.trim(), email: email.trim(), headline: "", skills: [], companyId }],
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
        }}
      >
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">{t.iAm}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["learner", t.learner],
                ["company", t.company],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 ${role === value ? "border-burgundy bg-burgundy-tint" : "border-line"}`}>
                <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} aria-label={label} className="accent-burgundy" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Input label={t.yourName} placeholder={t.namePlaceholder} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        {role === "company" && <Input label={t.companyName} placeholder={t.companyPlaceholder} required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />}
        <Input
          label={t.email}
          type="email"
          placeholder={role === "company" ? "hr@company.com" : t.emailPlaceholder}
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={taken ? t.emailTaken : undefined}
          hint={role === "company" ? t.emailHint : undefined}
        />
        <Button type="submit">{role === "company" ? t.continueRegistration : t.continueOnboarding}</Button>
      </form>
    </Card>
  );
}

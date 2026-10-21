"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { newId, setState, useData } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function Signup() {
  const { s } = useData();
  const [role, setRole] = useState<Role>("learner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const taken = s.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  return (
    <Card className="mx-auto max-w-lg">
      <Mascot pose="hello" size={96} priority className="-mt-2 mb-2" />
      <h1 className="text-h2">Create an account</h1>
      <p className="mt-1 mb-6 text-muted">Learners never pay to apply, take a challenge or interview.</p>
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
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="mb-1.5 text-sm font-medium">I am</legend>
          {(["learner", "company"] as const).map((r) => (
            <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 ${role === r ? "border-burgundy bg-burgundy-tint" : "border-line"}`}>
              <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="accent-burgundy" />
              {r === "learner" ? "A learner" : "A company"}
            </label>
          ))}
        </fieldset>
        <Input label="Your name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        {role === "company" && <Input label="Company name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />}
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={taken ? "An account with this email already exists." : undefined}
          hint={role === "company" ? "Use an email on your company's own domain." : undefined}
        />
        <Button type="submit">{role === "company" ? "Continue to registration" : "Continue to onboarding"}</Button>
      </form>
    </Card>
  );
}

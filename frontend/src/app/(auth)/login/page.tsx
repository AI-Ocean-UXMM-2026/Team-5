"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { setState, useData } from "@/lib/store";

export default function Login() {
  const { s } = useData();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const logIn = (id: string) => setState((st) => ({ ...st, sessionUserId: id }));

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <Card>
        <Mascot pose="wave" size={96} priority className="-mt-2 mb-2" />
        <h1 className="text-h2">Log in</h1>
        <p className="mt-1 mb-6 text-muted">One login for learners and companies. This demo has no passwords.</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const user = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
            if (user) logIn(user.id);
            else setError("No account with this email. Try a demo account or sign up.");
          }}
        >
          <Input label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit">Log in</Button>
        </form>
        <p className="mt-6 text-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-burgundy underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
      <Card>
        <h2 className="text-h4">Demo accounts</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {s.users.map((u) => {
            const company = s.companies.find((c) => c.id === u.companyId);
            const label = u.role === "learner" ? "Learner" : company?.status === "verified" ? "Verified company" : "Company, not verified";
            return (
              <li key={u.id}>
                <button type="button" onClick={() => logIn(u.id)} className="w-full rounded-xl border border-line px-4 py-3 text-left hover:border-burgundy hover:bg-burgundy-tint">
                  <span className="block font-medium">{u.name}</span>
                  <span className="text-body-sm text-muted">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

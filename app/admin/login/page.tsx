"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const password = String(new FormData(event.currentTarget).get("password") || "");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(json.error || "Could not sign in");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-hero bg-white p-8 shadow-lift">
        <p className="eyebrow">Private</p>
        <h1 className="font-display text-4xl">Admin</h1>
        <label className="field mt-6">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className="mt-3 text-sm text-amber">{error}</p> : null}
        <button className="btn mt-5 w-full" disabled={pending}>
          {pending ? "Checking" : "Enter"}
        </button>
      </form>
    </main>
  );
}

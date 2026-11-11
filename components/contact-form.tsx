"use client";

import { useState, type FormEvent } from "react";

export function BriefForm({ budgets }: { budgets: string[] }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState("sending");
    setError("");
    const response = await fetch("/api/collab-brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        project: data.get("project"),
        budget: data.get("budget"),
        link: data.get("link"),
        message: data.get("message"),
        website: data.get("website"),
      }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setState("error");
      setError(json.error || "Could not send that brief.");
      return;
    }
    setState("sent");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" data-track="collab_form_submit">
      <label className="hp" aria-hidden>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="field">
        <span>Name</span>
        <input name="name" required autoComplete="name" placeholder="Your name" />
      </label>
      <label className="field">
        <span>Project</span>
        <input name="project" required placeholder="Launch film or protocol" />
      </label>
      {budgets.length ? (
        <label className="field">
          <span>Budget range</span>
          <select name="budget" defaultValue={budgets[0]}>
            {budgets.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="field">
        <span>Link</span>
        <input name="link" type="url" placeholder="https://" />
      </label>
      <label className="field">
        <span>Note</span>
        <textarea name="message" placeholder="What should people replay?" />
      </label>
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending" : state === "sent" ? "Sent" : "Send the brief"}
      </button>
      {state === "error" ? <p className="text-sm text-amber">{error}</p> : null}
      {state === "sent" ? <p className="text-sm text-emerald-700">Got it. Tirta reads these from the admin inbox.</p> : null}
    </form>
  );
}

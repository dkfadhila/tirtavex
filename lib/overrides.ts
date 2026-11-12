import { revalidateTag } from "next/cache";
import type { SiteContent } from "./types";

/**
 * Content overrides stored as a JSON file in the site repo and edited through /admin.
 * Lets the admin save without a Postgres instance: every write is a single commit.
 */

const REPO = process.env.GITHUB_CONTENT_REPO?.trim() || "dkfadhila/tirtavex";
const PATH = process.env.GITHUB_CONTENT_PATH?.trim() || "content/overrides.json";
const BRANCH = process.env.GITHUB_CONTENT_BRANCH?.trim() || "main";
const API = "https://api.github.com";

export type Overrides = {
  collections?: Record<string, unknown[]>;
  settings?: Record<string, unknown>;
  stats?: Record<string, unknown>;
  legal?: Record<string, Record<string, unknown>>;
};

export function overridesEnabled() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

function headers() {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${token}`,
    "x-github-api-version": "2022-11-28",
    "content-type": "application/json",
  };
}

async function github(path: string, init?: RequestInit) {
  return fetch(`${API}/repos/${REPO}/contents/${path}`, {
    ...init,
    headers: headers(),
    cache: "no-store",
  });
}

export async function readOverrides(options: { fresh?: boolean } = {}): Promise<Overrides> {
  if (!overridesEnabled()) return {};
  try {
    const response = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, {
      headers: headers(),
      ...(options.fresh ? { cache: "no-store" as RequestCache } : { next: { revalidate: 30, tags: ["content-overrides"] } }),
    });
    if (!response.ok) return {};
    const json = (await response.json()) as { content?: string; encoding?: string };
    if (!json.content) return {};
    const text = Buffer.from(json.content, json.encoding === "base64" ? "base64" : "utf8").toString("utf8");
    const parsed = JSON.parse(text) as Overrides;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function writeOverrides(next: Overrides): Promise<void> {
  const shaResponse = await github(PATH + `?ref=${BRANCH}`);
  let sha: string | undefined;
  if (shaResponse.ok) {
    const meta = (await shaResponse.json()) as { sha?: string };
    sha = meta.sha;
  }
  const body = JSON.stringify(next, null, 2) + "\n";
  const response = await github(PATH, {
    method: "PUT",
    body: JSON.stringify({
      message: `content: update ${new Date().toISOString()}`,
      content: Buffer.from(body, "utf8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub write failed (${response.status}) ${detail.slice(0, 160)}`);
  }
  try {
    revalidateTag("content-overrides", "max");
  } catch {
    /* tag revalidation is only available inside a request scope */
  }
}

export function applyOverrides(base: SiteContent, overrides: Overrides): SiteContent {
  const next: SiteContent = { ...base };
  if (overrides.collections) {
    for (const [key, value] of Object.entries(overrides.collections)) {
      if (Array.isArray(value) && key in next) {
        (next as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }
  if (overrides.settings) next.settings = { ...base.settings, ...(overrides.settings as object) } as SiteContent["settings"];
  if (overrides.stats) next.stats = { ...base.stats, ...(overrides.stats as object) } as SiteContent["stats"];
  if (overrides.legal) {
    next.legal = {
      terms: { ...base.legal.terms, ...(overrides.legal.terms || {}) } as SiteContent["legal"]["terms"],
      privacy: { ...base.legal.privacy, ...(overrides.legal.privacy || {}) } as SiteContent["legal"]["privacy"],
    };
  }
  return next;
}

export const OVERRIDE_COLLECTIONS = [
  "work",
  "contests",
  "projects",
  "articles",
  "ambassadors",
  "tools",
  "links",
  "collabs",
  "programs",
  "testimonials",
  "process",
] as const;

const X_HOSTS = new Set(["x.com", "twitter.com", "mobile.twitter.com"]);

export function safeHttpUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeXUrl(input: string | null | undefined): string | null {
  const http = safeHttpUrl(input);
  if (!http) return null;
  const url = new URL(http);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!X_HOSTS.has(host)) return null;
  url.protocol = "https:";
  url.hostname = host === "twitter.com" || host === "mobile.twitter.com" ? "x.com" : host;
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export function xStatusId(input: string | null | undefined): string | null {
  const safe = safeXUrl(input);
  if (!safe) return null;
  const match = safe.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

export function safeColor(input: string | null | undefined, fallback = "#10B981"): string {
  if (!input) return fallback;
  const value = input.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback;
}

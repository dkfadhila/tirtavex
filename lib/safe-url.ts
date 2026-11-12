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

export function safeMediaUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("..")) return trimmed;
  return safeHttpUrl(trimmed);
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

export function isPlaceholderStatusUrl(input: string | null | undefined): boolean {
  const id = input?.match(/\/status\/(\d+)/)?.[1];
  return Boolean(id && /^10{8,}/.test(id));
}

export function isExampleHost(input: string | null | undefined): boolean {
  if (!input) return false;
  try {
    const host = new URL(input).hostname.toLowerCase().replace(/^www\./, "");
    return host === "example.com" || host.endsWith(".example.com") || host === "example.org" || host.endsWith(".example");
  } catch {
    return false;
  }
}

export function isPlaceholderEmail(input: string | null | undefined): boolean {
  if (!input) return false;
  return /@(?:example\.(?:com|org|net)|tirtavex\.example)$/i.test(input.trim());
}

export function safeColor(input: string | null | undefined, fallback = "#10B981"): string {
  if (!input) return fallback;
  const value = input.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback;
}

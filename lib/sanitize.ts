export function stripTags(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

export function stripHtml(input: string): string {
  return stripTags(input).replace(/\s+/g, " ").trim();
}

export function cleanText(input: unknown, max = 5000): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).slice(0, max);
}

export function cleanBlock(input: unknown, max = 20000): string {
  if (typeof input !== "string") return "";
  return stripTags(input)
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function cleanLines(input: unknown, max = 24): string[] {
  const source = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/\r?\n|,/)
      : [];
  const out: string[] = [];
  for (const item of source) {
    const text = cleanText(item, 180);
    if (!text) continue;
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

const DROP = new Set([
  "full_name",
  "sixty_word_bio",
  "city",
  "country",
  "season",
  "phone",
  "phone_number",
  "replace_via_agent",
  "domain",
  "nn",
  "like_this",
  "final_copy",
  "legal_entity",
  "privacy_email",
  "farcaster",
  "lens",
  "n",
]);

function humanize(token: string) {
  const key = token.trim().toLowerCase();
  if (!key || DROP.has(key)) return "";
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Public copy never shows unresolved {{tokens}}. Empty results are hidden. */
export function visibleText(input: string | null | undefined): string | null {
  if (input == null) return null;
  if (!input.includes("{{")) {
    const plain = input.trim();
    return plain || null;
  }
  let text = input.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, raw: string) => humanize(raw));
  text = text
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/([(\[])\s+/g, "$1")
    .replace(/\s+([)\]])/g, "$1")
    .replace(/(?:^|\.\s+)Based in\s*\.?/gi, "")
    .replace(/(?:^|\.\s+)Booking\s*\.?/gi, "")
    .replace(/\s+\./g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();
  if (!text || /^[-–—.,;:]+$/.test(text)) return null;
  return text;
}

export function show(input: string | null | undefined, fallback = ""): string {
  return visibleText(input) ?? fallback;
}

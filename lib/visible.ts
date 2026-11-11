/** A string that still contains an unpublished {{token}} is not public copy. */
export function visibleText(input: string | null | undefined): string | null {
  if (input == null) return null;
  const plain = input.trim();
  if (!plain || plain.includes("{{")) return null;
  return plain;
}

export function show(input: string | null | undefined, fallback = ""): string {
  return visibleText(input) ?? fallback;
}

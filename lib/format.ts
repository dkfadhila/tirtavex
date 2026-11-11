export function compactNumber(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs < 1000) return sign + new Intl.NumberFormat("en-US").format(Math.round(abs));
  const units = [
    { v: 1_000_000_000_000, s: "T" },
    { v: 1_000_000_000, s: "B" },
    { v: 1_000_000, s: "M" },
    { v: 1_000, s: "K" },
  ];
  for (const unit of units) {
    if (abs >= unit.v) {
      const scaled = abs / unit.v;
      const text = scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1);
      return sign + text.replace(/\.0$/, "") + unit.s;
    }
  }
  return sign + String(Math.round(abs));
}

export function fullNumber(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "not yet";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "not yet";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "item";
}

export function categoryLabel(category: string): string {
  switch (category) {
    case "ai-video":
      return "AI Video";
    case "web3":
      return "Web3";
    case "contest":
      return "Contest";
    case "collab":
      return "Collab";
    default:
      return category;
  }
}

export function placementLabel(placement: string): string {
  switch (placement) {
    case "winner":
      return "Winner";
    case "finalist":
      return "Finalist";
    case "top10":
      return "Top 10";
    case "participant":
      return "Participant";
    default:
      return placement;
  }
}

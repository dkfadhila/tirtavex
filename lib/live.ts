import type { Metrics, SiteContent, Stats, WorkItem } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isWorkItem(value: unknown): value is WorkItem {
  return isRecord(value) && typeof value.id === "string" && typeof value.xUrl === "string" && typeof value.title === "string";
}

export function applyLiveEvent(content: SiteContent, type: string, data: unknown): SiteContent {
  if (!isRecord(data) && type !== "content.refresh") return content;

  if (type === "metrics.update" && isRecord(data) && isRecord(data.metrics)) {
    return {
      ...content,
      work: content.work.map((item) =>
        item.id === data.id || item.xUrl === data.xUrl ? { ...item, metrics: { ...item.metrics, ...(data.metrics as Metrics) } } : item,
      ),
    };
  }

  if (type === "metrics.batch" && isRecord(data) && Array.isArray(data.items)) {
    const byId = new Map<string, Metrics>();
    for (const entry of data.items) {
      if (!isRecord(entry) || !isRecord(entry.metrics) || typeof entry.id !== "string") continue;
      byId.set(entry.id, entry.metrics as Metrics);
    }
    return {
      ...content,
      work: content.work.map((item) => (byId.has(item.id) ? { ...item, metrics: { ...item.metrics, ...byId.get(item.id)! } } : item)),
    };
  }

  if (type === "item.created" && isWorkItem(data)) {
    if (data.status !== "live") return content;
    if (content.work.some((item) => item.id === data.id)) return content;
    return { ...content, work: [...content.work, data] };
  }

  if (type === "item.updated" && isWorkItem(data)) {
    if (data.status !== "live") return { ...content, work: content.work.filter((item) => item.id !== data.id) };
    const exists = content.work.some((item) => item.id === data.id);
    return {
      ...content,
      work: exists ? content.work.map((item) => (item.id === data.id ? data : item)) : [...content.work, data],
    };
  }

  if (type === "item.removed" && isRecord(data) && typeof data.id === "string") {
    return { ...content, work: content.work.filter((item) => item.id !== data.id) };
  }

  if (type === "stats.update" && isRecord(data)) {
    const stats = data as Stats;
    return { ...content, stats: { ...content.stats, ...stats } };
  }

  if (type === "agent.heartbeat" && isRecord(data)) {
    return {
      ...content,
      agent: {
        lastHeartbeatAt: typeof data.lastHeartbeatAt === "string" ? data.lastHeartbeatAt : content.agent.lastHeartbeatAt,
        message: typeof data.message === "string" ? data.message : content.agent.message,
      },
    };
  }

  return content;
}

export const LIVE_EVENTS = [
  "metrics.update",
  "metrics.batch",
  "item.created",
  "item.updated",
  "item.removed",
  "stats.update",
  "agent.heartbeat",
  "content.refresh",
] as const;

export type LiveXProfile = {
  followers: number;
  posts: number;
  likes: number;
  fetchedAt: string;
};

const X_CACHE_SECONDS = 900;

export async function getLiveXProfile(handle: string): Promise<LiveXProfile | null> {
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return null;
  try {
    const response = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(clean)}`, {
      next: { revalidate: X_CACHE_SECONDS },
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      code?: number;
      user?: { followers?: number; tweets?: number; likes?: number };
    };
    if (payload.code !== 200 || !payload.user) return null;
    const followers = Number(payload.user.followers ?? 0);
    const posts = Number(payload.user.tweets ?? 0);
    const likes = Number(payload.user.likes ?? 0);
    if (!Number.isFinite(followers) || !Number.isFinite(posts)) return null;
    return { followers, posts, likes, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

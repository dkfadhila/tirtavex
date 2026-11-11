/**
 * One switch for the temporary reference stills.
 * "reference" uses the files in public/ref/.
 * "emerald" restores the original stills in public/media/.
 */
export const STILL_SOURCE = "reference" as "reference" | "emerald";

const ref = (file: string) => `/ref/${file}`;

const EMERALD = {
  hero: "/media/hero.webp",
  tiles: ["/media/tile-1.webp", "/media/tile-2.webp", "/media/tile-3.webp", "/media/tile-4.webp"],
  services: ["/media/work-1.webp", "/media/work-6.webp", "/media/work-3.webp", "/media/work-4.webp"],
  panels: ["/media/work-1.webp", "/media/work-2.webp", "/media/work-3.webp", "/media/work-4.webp", "/media/work-5.webp", "/media/work-6.webp"],
  gallery: ["/media/gallery-1.webp", "/media/gallery-2.webp", "/media/gallery-3.webp", "/media/gallery-4.webp", "/media/gallery-5.webp", "/media/gallery-6.webp"],
  strip: ["/media/tile-1.webp", "/media/tile-3.webp"],
};

const REFERENCE = {
  hero: ref("IAubOWZxmhZ5e1za7pq65WEPw08.png"),
  tiles: [
    ref("58jKnp7hLLzdDIH8AeZp1dVx5aM.jpg"),
    ref("Bd07BN5yigOLtP3SXyG8OJitnVc.png"),
    ref("t9xu7L7pgWCIoAuF7XpN5wR68.jpg"),
    ref("yt1ykFm0L5w8LPSajlK2ODHnbV4.jpg"),
  ],
  services: [
    ref("ITpGZlLAdXGOZVKWnm75N6wVjfc.jpg"),
    ref("2FM00bqWEGK3mmtwiRs1vglog.jpg"),
    ref("fcSHcQVqxfylWtBLVZnTa785QIQ.jpg"),
    ref("wZCUYE5tshEGLKtt2TFPutSNYFA.jpg"),
  ],
  panels: [
    ref("YRifwtsf27NA9JJ3Kk6Fkbpjf5c.jpg"),
    ref("QyZk6iOxtt7wTcx3BY9N04Fzho.jpg"),
    ref("K3XEnDJNSEezFEMGX6kdIr8AO4.jpg"),
    ref("dA9KH1T07Ni1ooBNNrF5VblptDw.png"),
    ref("gbfUNhaLfuATKHStvqntbNCxPc.png"),
    ref("fe9DVFqLYB4erAeOi5kusgvw8I.png"),
  ],
  gallery: [
    ref("DTzWM9SRMIIkew5kNETfW94louY.png"),
    ref("rdrJqECa20kUrojJQ32Y3nh9vUE.jpg"),
    ref("AthWw4Ai05n7k4YgVKKunrvjrk.jpg"),
    ref("E2r82XFiMafn8nGrWgnuC5ZBys.jpg"),
    ref("yLub9F8xOpJG9GEu7GwgxCs8Bdc.jpg"),
    ref("WBiahKAmjAmj5dwhwQGlNYPKQ.png"),
  ],
  strip: [ref("qWTotr93tiWSAYEmwH2GRxjl2Go.jpg"), ref("a4Nd2MSxjjWwGZ6lLY6y08tNXzw.jpg")],
};

export function stills() {
  return STILL_SOURCE === "emerald" ? EMERALD : REFERENCE;
}

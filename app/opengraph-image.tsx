import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F4FBF8", color: "#064E3B", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "70%" }}>
          <div style={{ fontSize: 28, letterSpacing: 4 }}>AI VIDEO × WEB3</div>
          <div style={{ fontSize: 92, lineHeight: 0.9, fontWeight: 700 }}>Tirta · @TirtaVEX</div>
        </div>
        <div style={{ width: 280, height: 280, borderRadius: 999, background: "#10B981", alignSelf: "center" }} />
      </div>
    ),
    size,
  );
}

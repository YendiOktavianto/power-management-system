import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";
const PRODUCT_KEY = process.env.NEXT_PUBLIC_PRODUCT_KEY || "product";

export async function GET() {
  try {
    const url = `${API_BASE}/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream error ${res.status} ${res.statusText} ${txt}` },
        { status: 502 }
      );
    }
    const json = await res.json();
    const data = "data" in json ? json.data : json;
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

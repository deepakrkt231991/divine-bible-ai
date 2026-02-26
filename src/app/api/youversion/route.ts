// app/api/youversion/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path"); // e.g. /v1/bibles/3034/passages/JHN.3.16
  if (!path) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  const fullUrl = `https://api.youversion.com${path}`;
  try {
    const res = await fetch(fullUrl, {
      headers: {
        "X-YVP-App-Key": process.env.NEXT_PUBLIC_YOUVERSION_KEY!,
        "Accept": "application/json",
      },
      next: { revalidate: 60 } // 1 minute cache
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json(
        { error: `YouVersion API error: ${res.status}`, detail: errBody },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy YouVersion error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

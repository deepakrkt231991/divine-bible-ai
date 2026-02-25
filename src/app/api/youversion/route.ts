import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.youversion.com";
const KEY = process.env.NEXT_PUBLIC_YOUVERSION_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  if (!KEY) {
    return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        "X-YVP-App-Key": KEY,
        "Accept": "application/json",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
        const errorData = await res.text();
        console.error("YouVersion API Error:", errorData);
        return NextResponse.json({ error: "Failed to fetch from YouVersion API", details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

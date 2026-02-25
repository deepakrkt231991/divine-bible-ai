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
    // Construct the YouVersion URL with forwarded search params (except 'path')
    const url = new URL(path.startsWith('/') ? path : `/${path}`, BASE);
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        url.searchParams.append(key, value);
      }
    });

    console.log("📡 Proxying to YouVersion:", url.toString());

    const res = await fetch(url.toString(), {
      headers: {
        "X-YVP-App-Key": KEY,
        "Accept": "application/json",
      },
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
        const errorData = await res.text();
        console.error("❌ YouVersion API Error:", res.status, errorData);
        return NextResponse.json({ error: "Failed to fetch from YouVersion API", details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.youversion.com";
const KEY = process.env.NEXT_PUBLIC_YOUVERSION_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Hum 'path' ko encode karke bhejenge taaki slashes ka lafda na ho
  const path = searchParams.get("path"); 

  if (!path) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  if (!KEY) {
    return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
  }

  // Path should start with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${BASE}${normalizedPath}`;
  
  console.log("🔗 Proxying to YouVersion:", fullUrl);

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "X-YVP-App-Key": KEY,
        "Accept": "application/json",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ YouVersion API Error (${res.status}):`, errorText);
      return NextResponse.json({ error: `YouVersion API responded with ${res.status}`, details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

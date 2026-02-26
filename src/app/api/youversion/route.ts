import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path"); // e.g. /v1/bibles/3034/passages/JHN.3.16
  
  if (!path) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  // Forward all other query params to YouVersion (e.g., language_ranges[])
  const query = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "path") query.append(key, value);
  });

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const fullUrl = `https://api.youversion.com${path}${queryString}`;

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "X-YVP-App-Key": process.env.NEXT_PUBLIC_YOUVERSION_KEY || "",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
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

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  const fullUrl = `https://api.youversion.com${path}`;

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "X-YVP-App-Key": process.env.NEXT_PUBLIC_YOUVERSION_KEY ?? "",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`YouVersion API Error ${res.status}:`, errBody);
      return NextResponse.json(
        { error: `YouVersion API error: ${res.status}`, detail: errBody },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy Internal Error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

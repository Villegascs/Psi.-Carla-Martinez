import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [usdRes, eurRes] = await Promise.all([
      fetch("https://ve.dolarapi.com/v1/dolares/oficial", { cache: "no-store" }),
      fetch("https://ve.dolarapi.com/v1/euros/oficial", { cache: "no-store" })
    ]);

    const usdData = await usdRes.json();
    const eurData = await eurRes.json();

    return NextResponse.json({
      usd: usdData.promedio,
      eur: eurData.promedio
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch BCV rates" }, { status: 500 });
  }
}

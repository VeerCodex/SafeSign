import { NextResponse } from "next/server";
import { fetchAllReports } from "@/lib/contract";


export async function GET() {
  try {
    const reports = await fetchAllReports();
    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch on-chain reports." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { analyzeSmartContract } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.code !== "string" || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please provide a valid 'code' string." },
        { status: 400 }
      );
    }

    const code = body.code.trim();

    if (code.length > 50000) {
      return NextResponse.json(
        { error: "Code payload exceeds maximum size limit (50,000 characters)." },
        { status: 413 }
      );
    }

    const result = await analyzeSmartContract(code);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in /api/analyze:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze contract.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

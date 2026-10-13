import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { registryAddress } = await req.json();

    if (!registryAddress || !registryAddress.startsWith("0x") || registryAddress.length !== 42) {
      return NextResponse.json(
        { error: "Invalid Ethereum contract address. Must start with 0x and be 42 characters." },
        { status: 400 }
      );
    }

    const envPath = path.resolve(process.cwd(), ".env.local");
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    if (content.includes("NEXT_PUBLIC_REGISTRY_ADDRESS=")) {
      content = content.replace(
        /NEXT_PUBLIC_REGISTRY_ADDRESS=.*/,
        `NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}`
      );
    } else {
      content += `\nNEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}\n`;
    }

    fs.writeFileSync(envPath, content);
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = registryAddress;

    return NextResponse.json({ success: true, registryAddress });
  } catch (error: any) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update config." }, { status: 500 });
  }
}

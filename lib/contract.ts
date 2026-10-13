import { createPublicClient, http, keccak256, toHex } from "viem";
import { monadTestnet } from "./monad";
import { SAFESIGN_REGISTRY_ABI } from "./abi";
import { OnChainReport } from "./types";

export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "").trim() as `0x${string}`;

/**
 * Creates a public client connected to Monad Testnet
 */
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz"),
});

/**
 * Computes keccak256 code hash of the Solidity source code
 */
export function computeCodeHash(sourceCode: string): `0x${string}` {
  // Normalize whitespace to prevent trivial spacing differences from changing hash
  const normalized = sourceCode.replace(/\r\n/g, "\n").trim();
  return keccak256(toHex(normalized));
}

/**
 * Fetches all reports saved on Monad Testnet
 */
export async function fetchAllReports(): Promise<OnChainReport[]> {
  if (!REGISTRY_ADDRESS || !REGISTRY_ADDRESS.startsWith("0x")) {
    console.warn("NEXT_PUBLIC_REGISTRY_ADDRESS is not set.");
    return [];
  }

  try {
    // First try querying contract's getAllReports view method
    const reports = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: SAFESIGN_REGISTRY_ABI,
      functionName: "getAllReports",
    }) as Array<{
      reporter: string;
      codeHash: string;
      score: number;
      verdict: string;
      timestamp: bigint;
    }>;

    return reports.map((r) => ({
      reporter: r.reporter,
      codeHash: r.codeHash,
      score: Number(r.score),
      verdict: r.verdict,
      timestamp: Number(r.timestamp),
    })).reverse(); // latest first
  } catch (err) {
    console.warn("Error reading from getAllReports, fallback to events:", err);
    try {
      // Fallback: read events
      const logs = await publicClient.getContractEvents({
        address: REGISTRY_ADDRESS,
        abi: SAFESIGN_REGISTRY_ABI,
        eventName: "ReportSaved",
        fromBlock: "earliest",
      });

      return logs.map((log) => {
        const args = log.args as {
          reporter: string;
          codeHash: string;
          score: number;
          verdict: string;
          timestamp: bigint;
        };
        return {
          reporter: args.reporter,
          codeHash: args.codeHash,
          score: Number(args.score),
          verdict: args.verdict,
          timestamp: Number(args.timestamp),
          txHash: log.transactionHash,
        };
      }).reverse();
    } catch (logErr) {
      console.error("Failed to query reports from chain:", logErr);
      return [];
    }
  }
}

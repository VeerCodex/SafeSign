import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "./types";
import { SAFE_CONTRACT_EXAMPLE, SCAM_CONTRACT_EXAMPLE } from "./examples";

const SYSTEM_PROMPT = `You are a smart contract security auditor. Explain risks to non-technical users. Look for: owner can mint unlimited tokens, owner can drain or withdraw user funds, hidden or changeable fees/taxes, blacklist or pause functions, upgradeable proxy risk, no renounced ownership, unlimited approvals, reentrancy, selfdestruct. Respond ONLY with valid JSON.`;

const PROMPT_TEMPLATE = `Analyze this Solidity smart contract code for security risks and explain what it does in plain English for a regular user who is about to sign a transaction or buy a token.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "riskScore": <number between 0 and 100, where 0 is completely safe and 100 is critical danger/scam>,
  "verdict": <"Safe" | "Caution" | "Dangerous">,
  "summary": <"2-3 plain English sentences explaining what the contract does and the overall risk level for a non-technical person">,
  "findings": [
    {
      "title": <"Short title of the risk/observation">,
      "severity": <"low" | "medium" | "high">,
      "explanation": <"One-line plain English explanation of why this matters">
    }
  ]
}

Solidity code to analyze:
`;

export async function analyzeSmartContract(code: string): Promise<AnalysisResult> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  // If no Gemini API key is configured, check if analyzing built-in example contracts for zero-friction demoing
  if (!apiKey || apiKey === "demo") {
    const trimmed = code.trim();
    if (trimmed === SAFE_CONTRACT_EXAMPLE.trim() || trimmed.includes("SafeCommunityToken")) {
      return {
        riskScore: 5,
        verdict: "Safe",
        summary: "This contract is a standard, fixed-supply ERC-20 token with no hidden fees or backdoors. The total supply is minted once at deployment and no additional tokens can ever be created. Users have full custody and control of their tokens.",
        findings: [
          {
            title: "Fixed Token Supply",
            severity: "low",
            explanation: "Supply is fixed at 1,000,000 tokens with no mint() function, preventing developer dilution.",
          },
          {
            title: "Standard Transfer Logic",
            severity: "low",
            explanation: "Transfers execute with 0% tax or hidden deduction fees.",
          },
          {
            title: "No Blacklist or Pause Mechanism",
            severity: "low",
            explanation: "No privileged owner addresses can lock user balances or halt transactions.",
          },
        ],
      };
    }

    if (trimmed === SCAM_CONTRACT_EXAMPLE.trim() || trimmed.includes("RocketMoonGem")) {
      return {
        riskScore: 98,
        verdict: "Dangerous",
        summary: "CRITICAL HONEYPOT DETECTED. The contract owner holds absolute power to drain user balances, mint unlimited tokens to dump on buyers, and secretly confiscates a 90% fee on transfers. Do not interact with or sign transactions for this contract.",
        findings: [
          {
            title: "Direct Victim Balance Drain",
            severity: "high",
            explanation: "emergencyDrainVictim() allows the contract creator to seize 100% of any user's token balance.",
          },
          {
            title: "Hidden 90% Transfer / Sell Tax",
            severity: "high",
            explanation: "Every transfer diverts 90% of the transacted tokens straight to the owner's personal wallet.",
          },
          {
            title: "Unlimited Minting Backdoor",
            severity: "high",
            explanation: "The owner can call mintUnlimited() anytime, generating infinite tokens to crash the market value.",
          },
          {
            title: "Arbitrary Wallet Blacklisting",
            severity: "high",
            explanation: "blacklistAddress() allows the creator to permanently freeze holders from transferring or selling.",
          },
        ],
      };
    }

    throw new Error(
      "GEMINI_API_KEY is not configured in .env.local. Please add your Google Gemini API key to .env.local to analyze custom contracts (or test with the Safe / Scam example buttons)."
    );
  }

  // Enforce input size limit (50k chars max)
  if (code.length > 50000) {
    throw new Error("Source code is too large (maximum 50,000 characters allowed).");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try flash models in order of preference
  const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const response = await model.generateContent(`${PROMPT_TEMPLATE}\n\n${code}`);
      const text = response.response.text();

      const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.riskScore !== "number" || !parsed.verdict || !parsed.summary || !Array.isArray(parsed.findings)) {
        throw new Error("Response JSON does not match required SafeSign schema.");
      }

      const score = Math.max(0, Math.min(100, Math.round(parsed.riskScore)));

      let verdict: "Safe" | "Caution" | "Dangerous" = "Caution";
      if (parsed.verdict.toLowerCase().includes("safe")) {
        verdict = "Safe";
      } else if (parsed.verdict.toLowerCase().includes("danger")) {
        verdict = "Dangerous";
      }

      if (score >= 60) verdict = "Dangerous";
      else if (score >= 25 && verdict === "Safe") verdict = "Caution";

      return {
        riskScore: score,
        verdict,
        summary: String(parsed.summary),
        findings: parsed.findings.map((f: { title?: string; severity?: string; explanation?: string }) => ({
          title: String(f.title || "Observation"),
          severity: (["low", "medium", "high"].includes(String(f.severity).toLowerCase())
            ? String(f.severity).toLowerCase()
            : "medium") as "low" | "medium" | "high",
          explanation: String(f.explanation || ""),
        })),
      };
    } catch (err: unknown) {
      lastError = err;
      const errorMsg = (err instanceof Error) ? err.message : String(err);
      if (errorMsg.includes("404") || errorMsg.includes("not found") || errorMsg.includes("unsupported")) {
        continue;
      }
      break;
    }
  }

  throw lastError || new Error("Failed to analyze contract with Gemini.");
}

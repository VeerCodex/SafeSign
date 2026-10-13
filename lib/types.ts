export type Severity = "low" | "medium" | "high";

export interface Finding {
  title: string;
  severity: Severity;
  explanation: string;
}

export interface AnalysisResult {
  riskScore: number;
  verdict: "Safe" | "Caution" | "Dangerous";
  summary: string;
  findings: Finding[];
}

export interface OnChainReport {
  reporter: string;
  codeHash: string;
  score: number;
  verdict: string;
  timestamp: number;
  txHash?: string;
}

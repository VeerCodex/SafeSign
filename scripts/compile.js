import fs from "fs";
import path from "path";
import solc from "solc";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractPath = path.resolve(__dirname, "../contracts/SafeSignRegistry.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "SafeSignRegistry.sol": {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

console.log("Compiling SafeSignRegistry.sol...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasErrors = false;
  for (const err of output.errors) {
    if (err.severity === "error") {
      console.error("Compilation error:", err.formattedMessage);
      hasErrors = true;
    } else {
      console.warn("Compilation warning:", err.formattedMessage);
    }
  }
  if (hasErrors) {
    process.exit(1);
  }
}

const contract = output.contracts["SafeSignRegistry.sol"]["SafeSignRegistry"];
const abi = contract.abi;
const bytecode = "0x" + contract.evm.bytecode.object;

// Write ABI to lib/abi.ts
const abiTsContent = `export const SAFESIGN_REGISTRY_ABI = ${JSON.stringify(abi, null, 2)} as const;\n`;
fs.writeFileSync(path.resolve(__dirname, "../lib/abi.ts"), abiTsContent);

// Write full artifact to lib/contractArtifact.json
fs.writeFileSync(
  path.resolve(__dirname, "../lib/contractArtifact.json"),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log("Compilation successful!");
console.log("- ABI written to lib/abi.ts");
console.log("- Artifact written to lib/contractArtifact.json");

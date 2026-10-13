import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

const monadChainId = process.env.MONAD_CHAIN_ID ? parseInt(process.env.MONAD_CHAIN_ID) : 143;
const monadRpcUrl = process.env.MONAD_RPC_URL || "https://rpc.monad.xyz";

const monadChain = defineChain({
  id: monadChainId,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [monadRpcUrl] },
    public: { http: [monadRpcUrl] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://monadscan.com" },
  },
  testnet: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config();

async function main() {
  console.log("=== SafeSignRegistry Monad Testnet Deployment ===");

  const rawKey = process.env.MONAD_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!rawKey) {
    console.error("❌ Error: MONAD_PRIVATE_KEY is missing in .env.local or environment.");
    console.error("Please add: MONAD_PRIVATE_KEY=your_private_key to .env.local");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);
  console.log(`Deployer Address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: monadChain,
    transport: http(monadRpcUrl),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Account Balance: ${Number(balance) / 1e18} MON`);

  if (balance === 0n) {
    console.warn("⚠️ Warning: Deployer account has 0 MON. You may need faucet testnet MON at https://testnet.monad.xyz");
  }

  const artifactPath = path.resolve(__dirname, "../lib/contractArtifact.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Artifact not found. Run 'node scripts/compile.js' first.");
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const walletClient = createWalletClient({
    account,
    chain: monadChain,
    transport: http(monadRpcUrl),
  });

  console.log("Deploying SafeSignRegistry to Monad Testnet (Chain ID 10143)...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    account,
  });

  console.log(`Transaction sent: ${hash}`);
  console.log(`Explorer: https://testnet.monadexplorer.com/tx/${hash}`);
  console.log("Waiting for block confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log("\n=============================================");
  console.log("✅ SafeSignRegistry deployed successfully!");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`View on Monad Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
  console.log("=============================================\n");

  // Automatically update .env.local with NEXT_PUBLIC_REGISTRY_ADDRESS
  const envPath = path.resolve(__dirname, "../.env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  if (envContent.includes("NEXT_PUBLIC_REGISTRY_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_REGISTRY_ADDRESS=.*/,
      `NEXT_PUBLIC_REGISTRY_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_REGISTRY_ADDRESS=${contractAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Updated NEXT_PUBLIC_REGISTRY_ADDRESS in .env.local to ${contractAddress}`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});

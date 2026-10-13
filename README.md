# 🛡️ SafeSign — AI Smart Contract Security Sentinel on Monad

> **Know what you're signing.**  
> Built for the **Monad Metropolis Hackathon**.

SafeSign is an AI-powered smart contract safety sentinel that deobfuscates complex Solidity code into plain, human-readable English before a user signs or interacts with it. When an audit is complete, SafeSign immutably commits the risk report to **Monad Testnet**, creating a decentralized, community-wide audit registry.

---

## 🎯 The Problem

1. **Blind Signing & Honeypots:** Web3 users regularly sign transactions and swap tokens without knowing what the contract actually executes. Malicious contracts conceal backdoors, 90%+ sell taxes, infinite minting functions, and arbitrary balance drains.
2. **Technical Barrier:** Non-technical users cannot read Solidity or bytecode to verify whether a project is safe.
3. **Fragmented Audit Records:** Security warnings often get lost across Discord and Twitter instead of being permanently tied to the contract's code hash on-chain.

---

## 💡 The Solution

SafeSign bridges the gap between deep smart contract security and everyday users:
- **Instant AI Deobfuscation:** Powered by Google Gemini Flash via server-side routes, SafeSign parses Solidity code and identifies honeypot mechanics, arbitrary withdrawals, backdoors, and centralization risks.
- **Plain-English Explanations:** Generates 2-3 sentence summaries in language anyone can understand, paired with an intuitive 0-100 risk score and color-coded verdict (**Safe**, **Caution**, **Dangerous**).
- **Immutable Monad Registry:** Users can immortalize any audit on **Monad Testnet** (`Chain ID: 10143`), recording the `codeHash` (`keccak256`), risk score, verdict, reporter address, and timestamp.
- **Public Audit Feed:** Anyone can explore previously audited contracts directly on Monad via `/reports`.

---

## 🏗️ How It Works

```
  +-----------------------+
  | User pastes Solidity  |
  | source code / example |
  +-----------+-----------+
              |
              v
  +-----------------------+       POST /api/analyze
  | Compute keccak256     | ----------------------------+
  | codeHash on client    |                             |
  +-----------------------+                             v
                                            +------------------------+
                                            |  Google Gemini Flash   |
                                            |  (Auditor Persona)     |
                                            +-----------+------------+
                                                        |
                                                        v
  +-----------------------+                 Returns Risk Score,
  | Interactive Result    | <---------------+ Verdict & Findings
  | Card & Explanations   |
  +-----------+-----------+
              |
              | Click "Save report on Monad"
              v
  +-----------------------------------------------------+
  | Monad Testnet (Chain ID 10143)                      |
  | Contract: SafeSignRegistry.sol                      |
  | function saveReport(codeHash, score, verdict)       |
  | event ReportSaved(reporter, codeHash, score, ...)   |
  +-----------------------------------------------------+
              |
              v
  +-----------------------------------------------------+
  | Live On-Chain Reports Feed (/reports)               |
  | Queryable by codeHash, verdict, or auditor address  |
  +-----------------------------------------------------+
```

---

## 🛠️ Tech Stack

- **Frontend & Server:** Next.js (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS + Glassmorphism Cyber-Dark Design System
- **AI Engine:** Google Gemini API (`@google/generative-ai`), called strictly server-side
- **Smart Contract:** Solidity `0.8.20` (`SafeSignRegistry.sol`) compiled with `solc`
- **Web3 & Blockchain:** `viem` + Injected Browser Wallet (`window.ethereum` - MetaMask, Rabby, Phantom)
- **Network:** **Monad Testnet**
  - **Chain ID:** `10143` (`0x279f`)
  - **RPC URL:** `https://testnet-rpc.monad.xyz`
  - **Block Explorer:** `https://testnet.monadexplorer.com`
  - **Currency:** `MON`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` (v20+ or v24 recommended)
- An EVM browser wallet (MetaMask, Rabby, etc.) configured for **Monad Testnet**
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
git clone https://github.com/your-username/SafeSign.git
cd SafeSign
npm install
```

### 3. Environment Setup
Copy the sample environment configuration:
```bash
cp .env.example .env.local
```
Fill in your credentials in `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_REGISTRY_ADDRESS=
```

### 4. Smart Contract Compilation & Deployment

Compile the Solidity registry contract:
```bash
npm run compile
```

Deploy to Monad Testnet using one of the following methods:

#### Method A: Direct Browser Wallet Deploy (Easiest)
1. Run the dev server: `npm run dev`
2. Open `http://localhost:3000/deploy`
3. Connect your wallet (switched to Monad Testnet) and click **"Deploy SafeSignRegistry on Monad"**
4. The deployed contract address is saved automatically to `.env.local`!

#### Method B: CLI Deployment Script
Add `MONAD_PRIVATE_KEY=your_private_key` to `.env.local` (with testnet MON from faucet) and run:
```bash
npm run deploy
```

#### Method C: Remix IDE
1. Open [Remix](https://remix.ethereum.org)
2. Create `SafeSignRegistry.sol` and paste code from `contracts/SafeSignRegistry.sol`
3. Compile with Solidity `0.8.20`
4. Under "Deploy & Run Transactions", choose **Injected Provider**, ensure network is Monad Testnet (`10143`), and click Deploy
5. Paste the deployed address into `.env.local` as `NEXT_PUBLIC_REGISTRY_ADDRESS=0x...` or via `http://localhost:3000/deploy`

---

## 💻 Running the App

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo & Testing Instructions

1. **Test Safe Contract:**
   - On the home page, click **"Load Safe Example"**.
   - Notice the standard, fixed-supply ERC-20 contract is loaded into the editor.
   - Click **"Analyze Contract"**.
   - View the **Risk Score 5 (Safe)** verdict and explanation highlighting zero hidden fees and no minting backdoor.

2. **Test Scam / Honeypot Contract:**
   - Click **"Load Scam Example"**.
   - A deceptive contract containing a 90% sell tax, unlimited owner minting, and emergency balance drain is loaded.
   - Click **"Analyze Contract"**.
   - View the **Risk Score 98 (Dangerous)** verdict with individual breakdown of high-severity findings.

3. **Save Report on Monad Testnet:**
   - Click **"Connect Wallet"** in the top navigation. If on another network, click **"Switch to Monad"**.
   - In the result card, click **"Save Report on Monad"**.
   - Confirm the transaction in MetaMask / Rabby.
   - Once confirmed, click **"View on Explorer"** to inspect the on-chain record on `https://testnet.monadexplorer.com`.

4. **View Live Reports Feed:**
   - Click **"On-Chain Reports"** in the navbar (or visit `/reports`).
   - Observe the live audit report with its Keccak-256 code hash, verdict badge, auditor address, and Monad transaction link.
   - Filter by verdict (Safe / Caution / Dangerous) or search by contract code hash.

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In Project Settings -> **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NEXT_PUBLIC_REGISTRY_ADDRESS`: Your deployed `SafeSignRegistry` address on Monad Testnet
4. Click **Deploy**!

---

## 🏆 Hackathon Attribution

Built for the **Monad Metropolis Hackathon**.  
*Security for everyone before they sign.*

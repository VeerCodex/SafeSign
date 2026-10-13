import { defineChain } from "viem";

export const MONAD_CHAIN_IDS = [143, 10143] as const;

export const monadChain = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz", "https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://rpc.monad.xyz", "https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadScan",
      url: "https://monadscan.com",
    },
  },
  testnet: true,
});

export const monadTestnet = monadChain;

export const MONAD_CHAIN_ID_HEX = "0x8f"; // 143 in hex
export const MONAD_TESTNET_CHAIN_ID_HEX = "0x279f"; // 10143 in hex

export function isMonadChain(chainId: number | null | undefined): boolean {
  return chainId === 143 || chainId === 10143;
}

export function getExplorerTxUrl(txHash: string): string {
  return `https://monadscan.com/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://monadscan.com/address/${address}`;
}

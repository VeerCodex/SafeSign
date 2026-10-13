import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadVision Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const MONAD_CHAIN_ID_HEX = "0x279f"; // 10143 in hex

export function getExplorerTxUrl(txHash: string): string {
  return `https://testnet.monadexplorer.com/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://testnet.monadexplorer.com/address/${address}`;
}

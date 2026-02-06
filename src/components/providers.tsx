"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { injected, walletConnect, metaMask } from "wagmi/connectors";
import { defineChain } from "viem";
import { useState, type ReactNode } from "react";
import { CircleWalletProvider } from "@/hooks/useCircleWallet";

// Force testnet only for HackMoney 2026
const IS_TESTNET = true;
const defaultChain = arbitrumSepolia;

// Arc Testnet definition (ChainID 5042002)
const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.testnet.arc.network",
    },
  },
  testnet: true,
});

// RPC URLs - testnet only
const ARBITRUM_SEPOLIA_RPC = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const ARC_TESTNET_RPC = process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";

console.log("RPC Configuration (Testnet Only):", {
  arbitrumSepolia: ARBITRUM_SEPOLIA_RPC,
  arcTestnet: ARC_TESTNET_RPC,
  defaultChain: defaultChain.name,
  isTestnet: IS_TESTNET,
});

// Wagmi config for testnet chains only
const config = createConfig({
  chains: [arcTestnet, arbitrumSepolia], // Arc Testnet first (source), then Arbitrum Sepolia (destination)
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [arcTestnet.id]: http(ARC_TESTNET_RPC),
    [arbitrumSepolia.id]: http(ARBITRUM_SEPOLIA_RPC),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CircleWalletProvider>
          {children}
        </CircleWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

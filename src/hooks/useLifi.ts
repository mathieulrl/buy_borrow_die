"use client";

import { useCallback, useState } from "react";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { parseUnits, formatUnits, type Address } from "viem";
import { arbitrumSepolia } from "wagmi/chains";

// LI.FI Route types
export interface LifiRoute {
  id: string;
  fromChainId: number;
  toChainId: number;
  fromToken: {
    address: Address;
    symbol: string;
    decimals: number;
    name: string;
  };
  toToken: {
    address: Address;
    symbol: string;
    decimals: number;
    name: string;
  };
  fromAmount: string;
  toAmount: string;
  gasCosts: Array<{
    amount: string;
    amountUSD: string;
    token: {
      address: Address;
      symbol: string;
      decimals: number;
    };
  }>;
  steps: Array<{
    type: string;
    tool: string;
    action: {
      toChain: number;
      toToken: Address;
      toAmount: string;
      slippage: number;
    };
    estimate: {
      gasCosts: Array<{
        amount: string;
        token: Address;
      }>;
      executionDuration: number;
    };
    transactionRequest?: {
      to: Address;
      data: `0x${string}`;
      value: string;
    };
  }>;
}

export interface LifiQuoteParams {
  fromChain: number;
  fromToken: Address;
  fromAmount: string;
  toChain: number;
  toToken: Address;
}

export function useLifi() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { sendTransactionAsync } = useSendTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get routes from LI.FI API
  const getRoutes = useCallback(
    async (params: LifiQuoteParams): Promise<LifiRoute[]> => {
      setIsLoading(true);
      setError(null);

      try {
        // LI.FI API endpoint for getting routes
        const response = await fetch(
          `https://li.quest/v1/quote?fromChain=${params.fromChain}&fromToken=${params.fromToken}&fromAmount=${params.fromAmount}&toChain=${params.toChain}&toToken=${params.toToken}&slippage=0.03`,
          {
            headers: {
              "Accept": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`LI.FI API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // LI.FI returns routes array
        if (data.routes && Array.isArray(data.routes)) {
          return data.routes as LifiRoute[];
        }

        // Fallback: if single route object
        if (data.steps) {
          return [data as LifiRoute];
        }

        return [];
      } catch (err: any) {
        setError(err.message || "Failed to fetch routes from LI.FI");
        console.error("LI.FI getRoutes error:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Execute a route (send transactions)
  const executeRoute = useCallback(
    async (route: LifiRoute) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        // LI.FI requires executing steps sequentially
        // Each step might require approval + transaction
        const executedSteps: string[] = [];

        for (const step of route.steps) {
          if (!step.transactionRequest) {
            console.warn("Step missing transaction request:", step);
            continue;
          }

          const txRequest = step.transactionRequest;

          // Send transaction
          const hash = await sendTransactionAsync({
            to: txRequest.to,
            data: txRequest.data as `0x${string}`,
            value: BigInt(txRequest.value || "0"),
          });

          executedSteps.push(hash);
          console.log(`✅ Step executed: ${step.type} via ${step.tool}`, hash);
        }

        return {
          success: true,
          transactionHashes: executedSteps,
          routeId: route.id,
        };
      } catch (err: any) {
        setError(err.message || "Failed to execute route");
        console.error("LI.FI executeRoute error:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, sendTransactionAsync]
  );

  // Helper: Get best route (lowest cost, fastest)
  const getBestRoute = useCallback(
    async (params: LifiQuoteParams): Promise<LifiRoute | null> => {
      const routes = await getRoutes(params);
      
      if (routes.length === 0) {
        return null;
      }

      // Sort by: 1) highest toAmount, 2) lowest gas cost
      const sorted = routes.sort((a, b) => {
        const aAmount = BigInt(a.toAmount);
        const bAmount = BigInt(b.toAmount);
        
        if (aAmount > bAmount) return -1;
        if (aAmount < bAmount) return 1;
        
        // If amounts equal, prefer lower gas cost
        const aGas = a.gasCosts.reduce((sum, cost) => sum + parseFloat(cost.amountUSD || "0"), 0);
        const bGas = b.gasCosts.reduce((sum, cost) => sum + parseFloat(cost.amountUSD || "0"), 0);
        
        return aGas - bGas;
      });

      return sorted[0];
    },
    [getRoutes]
  );

  // Helper: Check if cross-chain is needed
  const needsCrossChain = useCallback(
    (fromChain: number, toChain: number): boolean => {
      return fromChain !== toChain;
    },
    []
  );

  // Helper: Get target chain (Arbitrum Sepolia - testnet only)
  const getTargetChain = useCallback((): number => {
    return arbitrumSepolia.id; // Always Arbitrum Sepolia (testnet only)
  }, []);

  return {
    getRoutes,
    executeRoute,
    getBestRoute,
    needsCrossChain,
    getTargetChain,
    isLoading,
    error,
  };
}

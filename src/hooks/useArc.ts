"use client";

import { useCallback, useState, useEffect } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits, type Address } from "viem";
import { getContracts } from "@/lib/contracts";

// Arc Credit Line types
export interface ArcCreditLine {
  id: string;
  userAddress: Address;
  creditLimit: bigint;
  creditUsed: bigint;
  availableCredit: bigint;
  interestRate: number;
  collateralValue: bigint;
  ltv: number;
  healthFactor: number;
  status: "active" | "frozen" | "closed";
}

export interface ArcAgentDecision {
  action: "maintain" | "increase" | "decrease" | "freeze";
  reason: string;
  suggestedLTV: number;
  riskLevel: "low" | "medium" | "high";
}

// Mock Arc API client (would be replaced with actual Arc SDK/API)
class ArcClient {
  private baseUrl = process.env.NEXT_PUBLIC_ARC_API_URL || "https://api.testnet.arc.network";

  async getCreditLine(userAddress: Address, chainId: number): Promise<ArcCreditLine | null> {
    try {
      // Mock implementation - replace with actual Arc API call
      // In production, this would call Arc's API to get credit line data
      const response = await fetch(
        `${this.baseUrl}/v1/credit-lines/${userAddress}?chainId=${chainId}`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        // If no credit line exists, return null
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Arc API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        userAddress: data.userAddress as Address,
        creditLimit: BigInt(data.creditLimit || "0"),
        creditUsed: BigInt(data.creditUsed || "0"),
        availableCredit: BigInt(data.availableCredit || "0"),
        interestRate: data.interestRate || 0,
        collateralValue: BigInt(data.collateralValue || "0"),
        ltv: data.ltv || 0,
        healthFactor: data.healthFactor || 0,
        status: data.status || "active",
      };
    } catch (err: any) {
      // If API is not available, return null (graceful degradation)
      console.warn("Arc API not available, using mock data:", err.message);
      return null;
    }
  }

  async getAgentDecision(
    userAddress: Address,
    aavePosition: { collateral: bigint; debt: bigint; healthFactor: number }
  ): Promise<ArcAgentDecision> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/agent/decide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            userAddress,
            aavePosition,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Arc API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        action: data.action || "maintain",
        reason: data.reason || "No action needed",
        suggestedLTV: data.suggestedLTV || 50,
        riskLevel: data.riskLevel || "low",
      };
    } catch (err: any) {
      // Fallback to mock decision based on health factor
      console.warn("Arc agent API not available, using mock decision:", err.message);
      return this.getMockDecision(aavePosition);
    }
  }

  getMockDecision(aavePosition: { healthFactor: number }): ArcAgentDecision {
    if (aavePosition.healthFactor < 1.2) {
      return {
        action: "freeze",
        reason: "Health factor too low - risk of liquidation",
        suggestedLTV: 30,
        riskLevel: "high",
      };
    } else if (aavePosition.healthFactor < 1.5) {
      return {
        action: "decrease",
        reason: "Health factor below safe threshold - reducing exposure",
        suggestedLTV: 50,
        riskLevel: "medium",
      };
    } else if (aavePosition.healthFactor > 2.5) {
      return {
        action: "increase",
        reason: "Health factor very safe - can increase credit line",
        suggestedLTV: 70,
        riskLevel: "low",
      };
    }
    return {
      action: "maintain",
      reason: "Position is healthy - maintaining current credit line",
      suggestedLTV: 60,
      riskLevel: "low",
    };
  }

  async createCreditLine(
    userAddress: Address,
    initialLimit: bigint,
    collateralAddress: Address
  ): Promise<ArcCreditLine> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/credit-lines`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            userAddress,
            initialLimit: initialLimit.toString(),
            collateralAddress,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Arc API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        userAddress: data.userAddress as Address,
        creditLimit: BigInt(data.creditLimit || "0"),
        creditUsed: BigInt(data.creditUsed || "0"),
        availableCredit: BigInt(data.availableCredit || "0"),
        interestRate: data.interestRate || 0,
        collateralValue: BigInt(data.collateralValue || "0"),
        ltv: data.ltv || 0,
        healthFactor: data.healthFactor || 0,
        status: data.status || "active",
      };
    } catch (err: any) {
      console.error("Error creating credit line:", err);
      throw err;
    }
  }
}

const arcClient = new ArcClient();

export function useArc() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [creditLine, setCreditLine] = useState<ArcCreditLine | null>(null);
  const [agentDecision, setAgentDecision] = useState<ArcAgentDecision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Aave position data to feed to Arc agent
  // Only available on Arbitrum Sepolia, not on Arc Testnet
  const contracts = getContracts(chainId);
  const hasAavePool = "AAVE_POOL" in contracts;
  const { data: aaveAccountData } = useReadContract({
    address: hasAavePool ? contracts.AAVE_POOL : undefined,
    abi: [
      {
        inputs: [{ name: "user", type: "address" }],
        name: "getUserAccountData",
        outputs: [
          { name: "totalCollateralBase", type: "uint256" },
          { name: "totalDebtBase", type: "uint256" },
          { name: "availableBorrowsBase", type: "uint256" },
          { name: "currentLiquidationThreshold", type: "uint256" },
          { name: "ltv", type: "uint256" },
          { name: "healthFactor", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getUserAccountData",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasAavePool,
      refetchInterval: 30000,
    },
  });

  // Fetch credit line
  const fetchCreditLine = useCallback(async () => {
    if (!address) {
      setCreditLine(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credit = await arcClient.getCreditLine(address, chainId);
      setCreditLine(credit);
    } catch (err: any) {
      setError(err.message || "Failed to fetch credit line");
      console.error("Error fetching credit line:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  // Get agent decision based on Aave position
  const fetchAgentDecision = useCallback(async () => {
    if (!address || !aaveAccountData) {
      setAgentDecision(null);
      return;
    }

    try {
      const collateral = aaveAccountData[0] as bigint;
      const debt = aaveAccountData[1] as bigint;
      const healthFactor = Number(formatUnits(aaveAccountData[5] as bigint, 18));

      const decision = await arcClient.getAgentDecision(address, {
        collateral,
        debt,
        healthFactor,
      });

      setAgentDecision(decision);
    } catch (err: any) {
      console.error("Error fetching agent decision:", err);
      // Use mock decision as fallback
      if (aaveAccountData) {
        const healthFactor = Number(formatUnits(aaveAccountData[5] as bigint, 18));
        const decision = arcClient["getMockDecision"]({ healthFactor });
        setAgentDecision(decision);
      }
    }
  }, [address, aaveAccountData]);

  // Create new credit line
  const createCreditLine = useCallback(
    async (initialLimit: bigint, collateralAddress: Address) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const credit = await arcClient.createCreditLine(address, initialLimit, collateralAddress);
        setCreditLine(credit);
        return credit;
      } catch (err: any) {
        setError(err.message || "Failed to create credit line");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  // Auto-fetch when address or chain changes
  useEffect(() => {
    fetchCreditLine();
  }, [fetchCreditLine]);

  // Auto-fetch agent decision when Aave data changes
  useEffect(() => {
    fetchAgentDecision();
  }, [fetchAgentDecision]);

  return {
    creditLine,
    agentDecision,
    createCreditLine,
    refetchCreditLine: fetchCreditLine,
    isLoading,
    error,
  };
}

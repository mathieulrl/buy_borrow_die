"use client";

import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

interface CircleLoginResult {
  userToken: string;
  encryptionKey: string;
}

interface CircleWallet {
  id: string;
  address: string;
  blockchain: string;
  [key: string]: any;
}

interface CircleWalletContextValue {
  userId: string;
  setUserId: (id: string) => void;
  loginResult: CircleLoginResult | null;
  wallets: CircleWallet[];
  primaryWallet: CircleWallet | null;
  usdcBalance: string | null;
  status: string;
  isError: boolean;
  isBusy: boolean;
  connectCircle: (userId?: string) => Promise<void>;
}

const CircleWalletContext = createContext<CircleWalletContextValue | null>(null);

export function CircleWalletProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>("");
  const [loginResult, setLoginResult] = useState<CircleLoginResult | null>(null);
  const [wallets, setWallets] = useState<CircleWallet[]>([]);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const sdkRef = useRef<any | null>(null);

  // Initialize Circle SDK on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sdkRef.current) return;

    const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
    if (!appId) {
      console.warn("NEXT_PUBLIC_CIRCLE_APP_ID is not set. Circle wallet flow will not work.");
      return;
    }

    try {
      // Circle W3SSdk config type is broader; cast to any to allow appId
      sdkRef.current = new W3SSdk({ appId } as any);
    } catch (err) {
      console.error("Failed to initialize Circle W3S SDK:", err);
    }
  }, []);

  const callCircleApi = useCallback(async (action: string, params: any) => {
    const res = await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `Circle API error (${action})`);
    }
    return data;
  }, []);

  const loadWallets = useCallback(
    async (userToken: string) => {
      try {
        const data = await callCircleApi("listWallets", { userToken });
        const w = Array.isArray(data.wallets) ? data.wallets : data;
        setWallets(w || []);

        const primary = (w && w.length > 0 ? w[0] : null) as CircleWallet | null;
        if (primary) {
          const balances = await callCircleApi("getTokenBalance", {
            userToken,
            walletId: primary.id,
          });
          const tokenBalances = balances.tokenBalances || balances;
          const usdc = Array.isArray(tokenBalances)
            ? tokenBalances.find((t: any) => (t.token?.symbol || t.symbol) === "USDC")
            : null;
          setUsdcBalance(usdc ? usdc.amount || usdc.balance : null);
        }
      } catch (err: any) {
        console.error("Failed to load Circle wallets/balances:", err);
        setStatus(err.message || "Failed to load Circle wallets");
        setIsError(true);
      }
    },
    [callCircleApi]
  );

  const connectCircle = useCallback(
    async (maybeUserId?: string) => {
      const sdk = sdkRef.current;
      if (!sdk) {
        setIsError(true);
        setStatus("Circle SDK not ready");
        return;
      }

      let effectiveUserId = maybeUserId || userId;
      if (!effectiveUserId) {
        effectiveUserId = `user-${Math.random().toString(36).slice(2, 10)}`;
        setUserId(effectiveUserId);
      }

      setIsBusy(true);
      setIsError(false);
      setStatus("Creating Circle user...");

      try {
        await callCircleApi("createUser", { userId: effectiveUserId });

        setStatus("Getting user token...");
        const tokenRes = await callCircleApi("getUserToken", { userId: effectiveUserId });
        const lr: CircleLoginResult = {
          userToken: tokenRes.userToken,
          encryptionKey: tokenRes.encryptionKey,
        };
        setLoginResult(lr);

        setStatus("Initializing Circle user on Arc...");
        let newChallengeId: string | null = null;
        try {
          const initRes = await callCircleApi("initializeUser", {
            userToken: lr.userToken,
            blockchains: ["ARC-TESTNET"],
          });
          newChallengeId =
            typeof initRes.challengeId === "string" && initRes.challengeId.length > 0
              ? initRes.challengeId
              : null;

          if (newChallengeId) {
            // store in state for debugging/UX
            setChallengeId(newChallengeId);
          } else {
            await loadWallets(lr.userToken);
            setStatus("User already initialized. Wallet loaded.");
            return;
          }
        } catch (initErr: any) {
          const msg = initErr.message || "";
          if (msg.toLowerCase().includes("already initialized")) {
            await loadWallets(lr.userToken);
            setStatus("User already initialized. Wallet loaded.");
            return;
          }
          throw initErr;
        }

        setStatus("Executing Circle challenge (PIN UI)...");
        sdk.setAuthentication({
          userToken: lr.userToken,
          encryptionKey: lr.encryptionKey,
        });

        // Use the freshly returned challengeId from initializeUser, if present
        const currentChallengeId: string | null = newChallengeId;

        if (currentChallengeId) {
          await new Promise<void>((resolve, reject) => {
            sdk.execute(
              currentChallengeId,
              (error: any) => {
                if (error) {
                  reject(error);
                  return;
                }
                resolve();
              }
            );
          });

          setChallengeId(null);
          setStatus("Wallet created successfully. Loading wallets...");
        } else {
          // No challenge returned: user may already be initialized or config might not require PIN
          setStatus("No challengeId returned by Circle. Loading existing wallets...");
        }

        await loadWallets(lr.userToken);
        setStatus("Circle wallet ready on Arc Testnet.");
      } catch (err: any) {
        console.error("Circle connect error:", err);
        setIsError(true);
        setStatus(err.message || "Failed to connect Circle wallet");
      } finally {
        setIsBusy(false);
      }
    },
    [callCircleApi, userId, challengeId, loadWallets]
  );

  const primaryWallet = wallets.length > 0 ? wallets[0] : null;

  const value: CircleWalletContextValue = {
    userId,
    setUserId,
    loginResult,
    wallets,
    primaryWallet,
    usdcBalance,
    status,
    isError,
    isBusy,
    connectCircle,
  };

  return (
    <CircleWalletContext.Provider value={value}>
      {children}
    </CircleWalletContext.Provider>
  );
}

export function useCircleWallet(): CircleWalletContextValue {
  const ctx = useContext(CircleWalletContext);
  if (!ctx) {
    throw new Error("useCircleWallet must be used within a CircleWalletProvider");
  }
  return ctx;
}


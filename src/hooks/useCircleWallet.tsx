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
      setIsError(true);
      setStatus("Circle App ID not configured");
      return;
    }

    try {
      // Circle W3SSdk config
      const sdkConfig: any = { appId };
      
      // Determine environment from base URL
      // Default to Sandbox (testnet) for development
      const circleBaseUrl = process.env.NEXT_PUBLIC_CIRCLE_BASE_URL || "https://api-sandbox.circle.com";
      const isSandbox = circleBaseUrl.includes("sandbox");
      
      console.log("🔍 Circle SDK Configuration:");
      console.log("  - App ID:", appId.substring(0, 8) + "..." + appId.substring(appId.length - 4));
      console.log("  - Base URL:", circleBaseUrl);
      console.log("  - Environment:", isSandbox ? "SANDBOX" : "PRODUCTION");
      
      // Optionally include API key if available (for environment validation)
      // WARNING: Exposing API key in client-side code is a security risk
      const apiKey = process.env.NEXT_PUBLIC_CIRCLE_API_KEY;
      if (apiKey) {
        console.warn("⚠️ Using NEXT_PUBLIC_CIRCLE_API_KEY - This exposes your API key client-side!");
        sdkConfig.apiKey = apiKey;
        console.log("  - API Key provided (first 8 chars):", apiKey.substring(0, 8) + "...");
      }
      
      // Note: Circle SDK should auto-detect environment from appId
      // If it doesn't work, the appId might be from a different environment
      // than what the API key expects
      
      console.log("  - SDK Config:", JSON.stringify({ 
        appId: appId.substring(0, 8) + "...", 
        hasApiKey: !!apiKey,
        baseUrl: circleBaseUrl 
      }, null, 2));
      
      sdkRef.current = new W3SSdk(sdkConfig);
      console.log("✅ Circle W3S SDK initialized successfully");
      console.log("  - SDK instance created, ready to use");
    } catch (err: any) {
      console.error("❌ Failed to initialize Circle W3S SDK:", err);
      setIsError(true);
      setStatus(`Failed to initialize Circle SDK: ${err.message || "Unknown error"}`);
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
      setStatus("Verifying Circle configuration...");

      try {
        // First, verify Circle configuration to catch mismatches early
        try {
          const configCheck = await callCircleApi("checkConfig", {});
          // Default to Sandbox (testnet) for development
          const frontendBaseUrl = process.env.NEXT_PUBLIC_CIRCLE_BASE_URL || "https://api-sandbox.circle.com";
          const frontendEnv = frontendBaseUrl.includes("sandbox") ? "sandbox" : "production";
          
          console.log("🔍 Circle Configuration Comparison:");
          console.log("  - Backend Base URL:", configCheck.baseUrl);
          console.log("  - Backend Environment:", configCheck.environment);
          console.log("  - Frontend Base URL:", frontendBaseUrl);
          console.log("  - Frontend Environment:", frontendEnv);
          console.log("  - App ID from API:", configCheck.appId || "NOT RETURNED");
          console.log("  - Entity ID:", configCheck.entityId || "NOT RETURNED (normal for some endpoints)");
          
          if (configCheck.rawResponse) {
            console.log("  - Full API Response:", JSON.stringify(configCheck.rawResponse, null, 2));
          }
          
          // Check if App ID from API matches the one we're using
          const frontendAppId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
          if (configCheck.appId && frontendAppId && configCheck.appId !== frontendAppId) {
            console.error("❌ APP ID MISMATCH!");
            console.error(`  API returned: ${configCheck.appId}`);
            console.error(`  Frontend using: ${frontendAppId}`);
            console.error("  They must match! Update NEXT_PUBLIC_CIRCLE_APP_ID to match the API response.");
          } else if (configCheck.appId && frontendAppId && configCheck.appId === frontendAppId) {
            console.log("✅ App IDs match!");
          }
          
          // Warn if using production URL but should be sandbox
          if (configCheck.baseUrl === "https://api.circle.com" && configCheck.environment === "production") {
            console.warn("⚠️ WARNING: Using PRODUCTION Circle API!");
            console.warn("  If you're testing, you should use:");
            console.warn("  NEXT_PUBLIC_CIRCLE_BASE_URL=https://api-sandbox.circle.com");
          }
          
          if (configCheck.environment !== frontendEnv) {
            console.error("❌ ENVIRONMENT MISMATCH!");
            console.error(`  Backend is ${configCheck.environment}, but frontend is ${frontendEnv}`);
            console.error("  This will cause 'App ID not recognized' errors!");
            throw new Error(`Environment mismatch: Backend is ${configCheck.environment}, Frontend is ${frontendEnv}. They must match!`);
          }
          
          console.log("✅ Circle configuration verified - environments match");
          
          // Validate App ID specifically
          const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
          if (appId) {
            try {
              const appValidation = await callCircleApi("validateAppId", { appId });
              console.log("🔍 App ID Validation:", appValidation);
            } catch (validationErr: any) {
              console.warn("⚠️ Could not validate App ID:", validationErr.message);
            }
          }
        } catch (configErr: any) {
          console.error("❌ Circle config check failed:", configErr.message);
          // If it's an environment mismatch, throw it
          if (configErr.message.includes("Environment mismatch")) {
            throw configErr;
          }
          // Otherwise, continue - config check might fail but API calls might still work
          console.warn("⚠️ Continuing despite config check failure...");
        }

        setStatus("Creating Circle user...");
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
          const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
          // Default to Sandbox (testnet) for development
          const circleBaseUrl = process.env.NEXT_PUBLIC_CIRCLE_BASE_URL || "https://api-sandbox.circle.com";
          
          console.log("🔍 Circle SDK Debug Info:");
          console.log("  - Challenge ID:", currentChallengeId.substring(0, 8) + "...");
          console.log("  - App ID:", appId ? appId.substring(0, 8) + "..." + appId.substring(appId.length - 4) : "NOT SET");
          console.log("  - Base URL:", circleBaseUrl);
          console.log("  - Environment:", circleBaseUrl.includes("sandbox") ? "SANDBOX" : "PRODUCTION");
          console.log("  - User Token:", lr.userToken.substring(0, 20) + "...");
          
          // Verify appId is set before executing
          if (!appId) {
            throw new Error("NEXT_PUBLIC_CIRCLE_APP_ID is not set. Please configure it in your environment variables.");
          }
          
          // Follow Circle documentation exactly: sdk.execute(challengeId, (error, result) => {...})
          await new Promise<void>((resolve, reject) => {
            try {
              console.log("🚀 Executing Circle SDK challenge...");
              sdk.execute(
                currentChallengeId,
                (error: any, result: any) => {
                  if (error) {
                    console.error("❌ Circle SDK execute error:", error);
                    console.error("  - Error code:", error?.code);
                    console.error("  - Error message:", error?.message);
                    console.error("  - Full error object:", JSON.stringify(error, null, 2));
                    
                    // Provide more detailed error message based on error code
                    let errorMsg = "Circle SDK execution failed";
                    if (error?.code === 155114) {
                      errorMsg = `App ID not recognized (${error.code}). This usually means:\n\n` +
                        `1. Your NEXT_PUBLIC_CIRCLE_APP_ID (${appId?.substring(0, 8)}...) doesn't match your CIRCLE_API_KEY environment\n` +
                        `2. They are from different Circle environments (one is Sandbox, the other is Production)\n` +
                        `3. The App ID is not active or doesn't exist in your Circle Developer Console\n\n` +
                        `Please verify:\n` +
                        `- App ID in Circle Console: https://console.circle.com\n` +
                        `- API Key environment matches App ID environment\n` +
                        `- NEXT_PUBLIC_CIRCLE_BASE_URL matches your API Key environment`;
                    } else if (error?.code === 155706) {
                      errorMsg = "Network error. Please check your internet connection and Circle API status.";
                    } else if (error?.message) {
                      errorMsg = `Circle SDK error (${error.code || 'Unknown'}): ${error.message}`;
                    }
                    
                    reject(new Error(errorMsg));
                    return;
                  }
                  
                  // Success case - result may contain additional data
                  console.log("✅ Circle challenge executed successfully", result ? "(with result)" : "");
                  resolve();
                }
              );
            } catch (executeErr: any) {
              console.error("❌ Circle SDK execute exception:", executeErr);
              reject(new Error(`Circle SDK exception: ${executeErr.message || 'Unknown error'}`));
            }
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
        console.error("Error details:", {
          code: err?.code,
          message: err?.message,
          stack: err?.stack,
        });
        setIsError(true);
        // Provide more user-friendly error messages
        let errorMessage = "Failed to connect Circle wallet";
        if (err?.code === 155706) {
          errorMessage = "Network error: Unable to connect to Circle. Please check your internet connection and try again.";
        } else if (err?.message) {
          errorMessage = err.message;
        }
        setStatus(errorMessage);
      } finally {
        setIsBusy(false);
      }
    },
    [callCircleApi, userId, loadWallets]
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


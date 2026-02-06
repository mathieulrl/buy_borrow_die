# Technical Summary - BuyBorrowDie (200 words)

BuyBorrowDie democratizes the "Buy, Borrow, Die" wealth strategy by leveraging DeFi protocols on Arbitrum with cross-chain credit lines managed by Arc agents. Users deposit crypto from Arc Testnet, bridge to Arbitrum Sepolia via LI.FI, borrow without triggering taxable events, and maintain full upside exposure while accessing liquidity through Arc-managed USDC credit lines.

**Technical Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Wagmi v2 + Viem, Circle Smart Wallet, AAVE V3 on Arbitrum Sepolia, LI.FI SDK, ENS.

**Key Features:**
1. Cross-chain deposits from Arc Testnet to Arbitrum Sepolia via LI.FI
2. Automated DCA into WBTC/WETH
3. Non-custodial lending via AAVE V3 with real-time health factor monitoring
4. Arc credit lines: AI-powered USDC credit lines that automatically adjust based on Aave position health
5. Tax simulation engine: US federal and state capital gains tax calculator including NIIT
6. PnL simulator: Dynamic hedging strategies using Deribit options with auto-calibrated Smart Ratio
7. Macroeconomic dashboard: Real-time Polymarket data for Fed policy and recession probability

**Innovation:** The platform uniquely combines cross-chain credit lines, AI-powered risk management, tax optimization, options hedging, and macroeconomic analysis in a single DeFi interface, making sophisticated wealth preservation strategies accessible to retail users.

**Network:** Arc Testnet (5042002) → Arbitrum Sepolia (421614) via LI.FI bridge. Testnet only for HackMoney 2026.

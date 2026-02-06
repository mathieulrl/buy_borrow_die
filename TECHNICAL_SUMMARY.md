# Technical Summary - BuyBorrowDie

## Project Overview

BuyBorrowDie democratizes the "Buy, Borrow, Die" wealth strategy—traditionally exclusive to ultra-high-net-worth individuals—by leveraging DeFi protocols on Arbitrum with cross-chain credit lines managed by Arc agents. The platform enables users to deposit crypto assets from any chain (starting with Arc Testnet), bridge to Arbitrum via LI.FI, borrow against them without triggering taxable events, and maintain full upside exposure while accessing liquidity through Arc-managed USDC credit lines.

## Technical Architecture

**Frontend Stack:**
- Next.js 14 with React 18 and TypeScript
- Tailwind CSS with Framer Motion for animations
- Circle Smart Wallet for account abstraction (gasless transactions)
- Recharts for financial data visualization

**Web3 Integration:**
- Wagmi v2 + Viem for Ethereum interactions
- AAVE V3 protocol integration on Arbitrum Sepolia for lending/borrowing
- LI.FI SDK for cross-chain routing (Arc Testnet → Arbitrum Sepolia)
- Circle Smart Wallet for account abstraction
- ENS for user identity and profile management

**Key Features:**
1. **Cross-Chain Deposits**: Bridge assets from Arc Testnet (or any supported chain) to Arbitrum Sepolia via LI.FI
2. **Automated DCA Strategy**: Dollar-cost averaging into WBTC and WETH with configurable allocation
3. **Collateralized Borrowing**: Non-custodial lending via AAVE V3 with real-time health factor monitoring
4. **Arc Credit Lines**: USDC credit lines managed by Arc agents that automatically adjust based on Aave position health
5. **Tax Simulation Engine**: Comprehensive calculator for US federal and state capital gains taxes, including NIIT
6. **PnL Simulator**: Interactive tool modeling dynamic hedging strategies using Deribit options (Bear Put Spread) with auto-calibrated Smart Ratio
7. **Macroeconomic Dashboard**: Real-time Polymarket data integration for Fed policy and recession probability tracking
8. **ENS Integration**: User identity and strategy personalization using ENS names

**Innovation:**
The platform uniquely combines:
- Cross-chain credit lines (Arc Testnet → Arbitrum Sepolia)
- AI-powered risk management through Arc agents
- Tax optimization strategies
- Risk management through options hedging
- Macroeconomic analysis
- ENS-native user experience

All in a single DeFi interface, making sophisticated wealth preservation strategies accessible to retail users.

**Network Architecture:**
- **Source Chain**: Arc Testnet (ChainID 5042002) - USDC-native chain
- **Destination Chain**: Arbitrum Sepolia (ChainID 421614) - For Aave V3 interactions
- **Bridge**: LI.FI for cross-chain routing
- **Testnet Only**: All operations are on testnet for HackMoney 2026

## Sponsor Integrations

### LI.FI - Cross-Chain Routing
- **Integration**: LI.FI SDK for bridging assets from Arc Testnet to Arbitrum Sepolia
- **Features**: 
  - Multi-chain deposit support
  - Best route finding
  - Gas cost estimation
  - Transaction status tracking
- **Location**: `src/hooks/useLifi.ts`, `src/components/sections/dashboard.tsx` (CrossChainDepositForm)

### Arc - Credit Line Management
- **Integration**: Arc API for USDC credit line management
- **Features**:
  - Automated credit line creation based on Aave collateral
  - AI agent decisions (maintain/increase/decrease/freeze)
  - Risk level assessment (low/medium/high)
  - Real-time LTV and health factor monitoring
- **Location**: `src/hooks/useArc.ts`, `src/components/sections/dashboard.tsx` (ArcCreditLineCard)

### ENS - User Identity
- **Integration**: ENS name and avatar resolution via wagmi
- **Features**:
  - ENS name display in header
  - ENS avatar support
  - Strategy personalization by ENS name (future enhancement)
- **Location**: `src/components/layout/header.tsx`

## Smart Contracts

### Arc Testnet (ChainID 5042002)
| Contract | Address |
|----------|---------|
| USDC (Native) | Native currency (6 decimals) |
| MULTICALL3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### Arbitrum Sepolia (ChainID 421614)
| Contract | Address |
|----------|---------|
| AAVE V3 Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| AAVE Pool Data Provider | `0x3e9708d80f7B3e43118013075F7e95CE3AB31F31` |
| AAVE Oracle | `0x2da88497588bF89281816106C7259e31AF45a663` |
| USDC | `0x75faf114eafb1BDbe2F0316DF893fd58cE30AF7E` |
| WBTC | `0x29f2D40B0605204364c54D4cEE5132adD012B9C2` |
| WETH | `0x980B62Da83eFf3D4576C647993b0c1D7faf17c73` |
| aUSDC | `0x16dA4541aD1807f4443d92E2604C3aD0D0DA23b4` |
| aWBTC | `0x5E8C8A7243651DB1384C0dDfDaE44067E4534556` |
| aWETH | `0x4e0f2Cd4b5A5F0aDd0a8F4cE9F0389a78919c8B8` |
| variableDebtUSDC | `0x52A1CeB68Ee6b7B5D13E0376A1E0E4423A8cE26e` |
| UNISWAP_ROUTER | `0xE592427A0AEce92De3Edee1F18E0157C05861564` |
| MULTICALL3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

## User Flow

1. **Start on Arc Testnet**: User has USDC on Arc Testnet (native currency)
2. **Bridge to Arbitrum**: User bridges USDC from Arc Testnet to Arbitrum Sepolia via LI.FI
3. **Swap to WBTC/WETH**: User swaps USDC to WBTC/WETH on Arbitrum (via Uniswap or DCA)
4. **Deposit to Aave**: User deposits WBTC/WETH to Aave V3 on Arbitrum Sepolia
5. **Borrow USDC**: User borrows USDC against collateral
6. **Arc Credit Line**: Arc agent monitors position and manages USDC credit line
7. **Agent Decisions**: Arc agent adjusts credit limits based on health factor and risk

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect Project ID | Yes |
| `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` | Arbitrum Sepolia RPC URL | No |
| `NEXT_PUBLIC_ARC_TESTNET_RPC_URL` | Arc Testnet RPC URL | No |
| `NEXT_PUBLIC_ARC_API_URL` | Arc API endpoint | Optional (uses mock if not provided) |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
├── components/
│   ├── layout/             # Header, Footer
│   ├── sections/           # Hero, HowItWorks, Dashboard
│   ├── ui/                 # Reusable UI components
│   └── providers.tsx       # Web3 providers (wagmi + Circle Wallet)
├── hooks/
│   ├── useAave.ts          # AAVE V3 integration hooks
│   ├── useLifi.ts          # LI.FI cross-chain routing
│   ├── useArc.ts           # Arc credit line management
│   └── usePrices.ts        # Price feed hooks
└── lib/
    ├── contracts.ts        # Contract addresses & ABIs
    ├── store.ts            # Zustand state management
    └── utils.ts            # Utility functions
```

## Security Considerations

- **Non-Custodial**: Users maintain control of their assets
- **Battle-tested Protocols**: Built on AAVE V3, audited and trusted
- **Health Factor Monitoring**: Clear liquidation risk indicators
- **Arc Agent Risk Management**: Automated credit line adjustments based on position health
- **Conservative Defaults**: 50% LTV recommended for safety
- **Testnet Only**: All operations on testnet for development and testing

## Future Enhancements

- Full Circle Smart Wallet integration for gasless transactions
- Enhanced ENS integration for strategy personalization
- Real-time Arc agent decision visualization
- Multi-chain credit line aggregation
- Advanced risk management strategies

---

Built with ❤️ for ETHGlobal HackMoney 2026
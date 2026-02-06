# BuyBorrowDie - Buy, Borrow, Die 🔥

> The wealth strategy of billionaires, now accessible to everyone through cross-chain DeFi credit lines.

![BuyBorrowDie Banner](https://img.shields.io/badge/Built%20for-HackMoney%202026-purple?style=for-the-badge)
![Arbitrum](https://img.shields.io/badge/Network-Arbitrum%20Sepolia-28A0F0?style=for-the-badge)
![LI.FI](https://img.shields.io/badge/Cross-chain-LI.FI-6366F1?style=for-the-badge)
![Arc](https://img.shields.io/badge/Credit%20Lines-Arc-8B5CF6?style=for-the-badge)

## 🎯 What is Buy, Borrow, Die?

**"Buy, Borrow, Die"** is a wealth-building strategy traditionally used by the ultra-wealthy:

1. **Buy** appreciating assets (stocks, real estate, crypto)
2. **Borrow** against those assets instead of selling them
3. **Die** (or live!) while the debt remains fixed and assets keep appreciating

The key insight: **borrowing isn't a taxable event**. By never selling, you defer capital gains indefinitely while maintaining liquidity for your lifestyle.

### The Problem

Until recently, this strategy was only accessible to millionaires with private bankers. JPMorgan just started offering Bitcoin-backed loans, but only to their high-net-worth clients.

### The Solution: BuyBorrowDie

BuyBorrowDie democratizes this strategy using cross-chain DeFi protocols:

- 🌉 **Cross-Chain Deposits**: Start on Arc Testnet (USDC-native), bridge to Arbitrum via LI.FI
- 💰 **Deposit** USDC, convert to WBTC/WETH via DCA
- 🏦 **Borrow** USDC against your crypto collateral on AAVE V3
- 🤖 **Arc Agents**: AI-powered credit line management that adjusts based on your position health
- 🚀 **Live** your life using borrowed funds while your crypto appreciates
- 📈 **Never sell** - no capital gains, maximum upside
- 🆔 **ENS Identity**: Personalized experience with ENS names

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Web3**: 
  - wagmi v2 + viem
  - Circle Smart Wallet (Account Abstraction)
  - ENS for identity
- **DeFi Integration**: 
  - AAVE V3 on Arbitrum Sepolia
  - LI.FI for cross-chain routing
  - Arc for credit line management
- **State Management**: Zustand
- **Networks**: 
  - Arc Testnet (ChainID 5042002) - Source chain
  - Arbitrum Sepolia (ChainID 421614) - Destination for Aave

## 🚀 Features

### Core Functionality

- ✅ **Cross-Chain Bridge**: Deposit from Arc Testnet (or any supported chain) to Arbitrum via LI.FI
- ✅ **DCA Strategy**: Automated Dollar-Cost Averaging into WBTC, WETH
- ✅ **Collateral Management**: Deposit crypto to AAVE V3 on Arbitrum Sepolia
- ✅ **Borrowing**: Borrow USDC against your collateral
- ✅ **Health Factor Monitoring**: Real-time liquidation risk tracking
- ✅ **Arc Credit Lines**: USDC credit lines managed by AI agents
- ✅ **Agent Decisions**: Real-time risk assessment and credit limit adjustments
- ✅ **ENS Integration**: User identity with ENS names and avatars
- ✅ **Smart Wallet**: Gasless transactions with Circle Smart Wallet

### Dashboard

- Portfolio overview with real-time prices
- Cross-chain deposit interface (LI.FI)
- DCA configuration (amount, frequency, allocation)
- Borrow/Repay interface with LTV slider
- Health Factor gauge visualization
- Arc credit line management and agent decisions
- Transaction history

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/BuyBorrowDie.git
cd BuyBorrowDie

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
# - Get WalletConnect Project ID from https://cloud.walletconnect.com/
# - Optional: Arc API URL (uses mock if not provided)

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect Project ID | Yes |
| `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` | Arbitrum Sepolia RPC URL | No |
| `NEXT_PUBLIC_ARC_TESTNET_RPC_URL` | Arc Testnet RPC URL | No |
| `NEXT_PUBLIC_ARC_API_URL` | Arc API endpoint | Optional |

## 🏗 Project Structure

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
│   └── providers.tsx      # Web3 providers
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

## 🔗 Smart Contracts

### Arc Testnet (ChainID 5042002)
| Contract | Address |
|----------|---------|
| USDC (Native) | Native currency (6 decimals) |
| MULTICALL3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### Arbitrum Sepolia (ChainID 421614)
| Contract | Address |
|----------|---------|
| AAVE V3 Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| USDC | `0x75faf114eafb1BDbe2F0316DF893fd58cE30AF7E` |
| WBTC | `0x29f2D40B0605204364c54D4cEE5132adD012B9C2` |
| WETH | `0x980B62Da83eFf3D4576C647993b0c1D7faf17c73` |

## 🎨 UI/UX Features

- **Dark Mode**: Elegant dark theme with glassmorphism effects
- **Responsive**: Mobile-first design
- **Animations**: Smooth Framer Motion transitions
- **Real-time Updates**: Live price feeds and position updates
- **Accessible**: WCAG compliant components
- **Cross-Chain UX**: Seamless bridging experience with LI.FI

## 🏆 Hackathon Tracks & Bounties

This project is built for **ETHGlobal HackMoney 2026** and targets:

### LI.FI - Cross-Chain Routing
- ✅ LI.FI SDK integration for multi-chain deposits
- ✅ Arc Testnet → Arbitrum Sepolia bridging
- ✅ Best route finding and gas estimation
- ✅ Transaction status tracking

### Arc - Credit Line Management
- ✅ USDC credit line creation and management
- ✅ AI agent decisions based on Aave position health
- ✅ Risk level assessment (low/medium/high)
- ✅ Automated credit limit adjustments

### ENS - User Identity
- ✅ ENS name and avatar resolution
- ✅ Personalized user experience
- ✅ Strategy personalization by ENS name (future)

## 🔐 Security Considerations

- **Non-Custodial**: Users maintain control of their assets
- **Battle-tested Protocols**: Built on AAVE V3, audited and trusted
- **Health Factor Monitoring**: Clear liquidation risk indicators
- **Arc Agent Risk Management**: Automated credit line adjustments
- **Conservative Defaults**: 50% LTV recommended for safety
- **Testnet Only**: All operations on testnet for development

## 📚 Learn More

- [AAVE V3 Documentation](https://docs.aave.com/developers/getting-started/readme)
- [Arbitrum Documentation](https://docs.arbitrum.io/)
- [LI.FI Documentation](https://docs.li.fi/)
- [Arc Documentation](https://docs.arc.network/)
- [ENS Documentation](https://docs.ens.domains/)
- [Circle Smart Wallet](https://developers.circle.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

This application is for educational and hackathon purposes. DeFi involves significant risks including:
- **Smart Contract Risk**: Bugs in protocols
- **Liquidation Risk**: Collateral can be liquidated if health factor drops
- **Market Risk**: Crypto prices are volatile
- **Cross-Chain Risk**: Bridge protocols may have vulnerabilities

**Not financial advice. Do your own research.**

---

Built with ❤️ for ETHGlobal HackMoney 2026

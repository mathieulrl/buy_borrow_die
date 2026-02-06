// Contract addresses - Testnet only
export const CONTRACTS = {
  // Arc Testnet (ChainID 5042002)
  arcTestnet: {
    // USDC on Arc Testnet (native currency)
    USDC: "0x0000000000000000000000000000000000000000" as const, // Native USDC on Arc (address may need to be updated)
    
    // Multicall3 for batching transactions
    MULTICALL3: "0xcA11bde05977b3631167028862bE2a173976CA11" as const,
  },
  
  // Arbitrum Sepolia (Testnet) - Destination for Aave
  arbitrumSepolia: {
    // AAVE V3 on Arbitrum Sepolia (testnet addresses - may need to be updated)
    AAVE_POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" as const,
    AAVE_POOL_DATA_PROVIDER: "0x3e9708d80f7B3e43118013075F7e95CE3AB31F31" as const,
    AAVE_ORACLE: "0x2da88497588bF89281816106C7259e31AF45a663" as const,
    
    // Tokens (Testnet versions)
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58cE30AF7E" as const, // USDC on Arbitrum Sepolia
    WBTC: "0x29f2D40B0605204364c54D4cEE5132adD012B9C2" as const, // WBTC on Arbitrum Sepolia (testnet)
    WETH: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73" as const, // WETH on Arbitrum Sepolia (testnet)
    
    // Uniswap V3 Router for swaps
    UNISWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564" as const, // Uniswap V3 SwapRouter (same on testnet)
    
    // Multicall3 for batching transactions
    MULTICALL3: "0xcA11bde05977b3631167028862bE2a173976CA11" as const, // Multicall3 (same address on all chains)
    
    // AAVE aTokens
    aUSDC: "0x16dA4541aD1807f4443d92E2604C3aD0D0DA23b4" as const,
    aWBTC: "0x5E8C8A7243651DB1384C0dDfDaE44067E4534556" as const, // Testnet aWBTC
    aWETH: "0x4e0f2Cd4b5A5F0aDd0a8F4cE9F0389a78919c8B8" as const, // Testnet aWETH
    
    // AAVE debt tokens  
    variableDebtUSDC: "0x52A1CeB68Ee6b7B5D13E0376A1E0E4423A8cE26e" as const,
  },
} as const;

// Token metadata
export const TOKENS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "$",
    color: "#2775CA",
  },
  WBTC: {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    icon: "₿",
    color: "#F7931A",
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    icon: "Ξ",
    color: "#627EEA",
  },
} as const;

// ABIs (minimal for the functions we need)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

export const AAVE_POOL_ABI = [
  // Supply
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Withdraw
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Borrow
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "referralCode", type: "uint16" },
      { name: "onBehalfOf", type: "address" },
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Repay
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    name: "repay",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Get user account data
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
] as const;

export const AAVE_DATA_PROVIDER_ABI = [
  // Get user reserve data
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "user", type: "address" },
    ],
    name: "getUserReserveData",
    outputs: [
      { name: "currentATokenBalance", type: "uint256" },
      { name: "currentStableDebt", type: "uint256" },
      { name: "currentVariableDebt", type: "uint256" },
      { name: "principalStableDebt", type: "uint256" },
      { name: "scaledVariableDebt", type: "uint256" },
      { name: "stableBorrowRate", type: "uint256" },
      { name: "liquidityRate", type: "uint256" },
      { name: "stableRateLastUpdated", type: "uint40" },
      { name: "usageAsCollateralEnabled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Get reserve data
  {
    inputs: [{ name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      { name: "unbacked", type: "uint256" },
      { name: "accruedToTreasuryScaled", type: "uint256" },
      { name: "totalAToken", type: "uint256" },
      { name: "totalStableDebt", type: "uint256" },
      { name: "totalVariableDebt", type: "uint256" },
      { name: "liquidityRate", type: "uint256" },
      { name: "variableBorrowRate", type: "uint256" },
      { name: "stableBorrowRate", type: "uint256" },
      { name: "averageStableBorrowRate", type: "uint256" },
      { name: "liquidityIndex", type: "uint256" },
      { name: "variableBorrowIndex", type: "uint256" },
      { name: "lastUpdateTimestamp", type: "uint40" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Helper to get contracts for a specific chain
export function getContracts(chainId: number) {
  switch (chainId) {
    case 5042002: // Arc Testnet
      return CONTRACTS.arcTestnet;
    case 421614: // Arbitrum Sepolia
      return CONTRACTS.arbitrumSepolia;
    default:
      return CONTRACTS.arbitrumSepolia; // Default to Arbitrum Sepolia (destination)
  }
}


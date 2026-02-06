"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useChainId, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { Zap, Menu, X, AlertTriangle, Loader2, Network } from "lucide-react";
import { useCircleWallet } from "@/hooks/useCircleWallet";

const navLinks = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Macro Outlook", href: "#macro-outlook" },
  { name: "Tax Simulator", href: "#tax-simulator" },
  { name: "PnL Simulator", href: "#pnl-simulator" },
  { name: "Dashboard", href: "#dashboard" },
  { name: "Docs", href: "#docs" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [networkMenuOpen, setNetworkMenuOpen] = useState(false);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { primaryWallet, status, isError, isBusy, connectCircle } = useCircleWallet();
  
  // Prevent hydration mismatch - only render wallet UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Testnet only - Arc Testnet or Arbitrum Sepolia
  const currentChainId = chainId || arbitrumSepolia.id;
  const isArcTestnet = currentChainId === 5042002;
  const networkName = isArcTestnet ? "Arc Testnet" : currentChainId === arbitrumSepolia.id ? "Arbitrum Sepolia" : "Unknown";
  
  const handleSwitchNetwork = (targetChainId: number) => {
    if (currentChainId !== targetChainId) {
      switchChain({ chainId: targetChainId });
      setNetworkMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Testnet Banner - always show (testnet only) */}
      {mounted && (
        <div className={`${isArcTestnet ? 'bg-purple-500/20 border-purple-500/30' : 'bg-yellow-500/20 border-yellow-500/30'} border-b px-4 py-1.5`}>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm" style={{ color: isArcTestnet ? '#a855f7' : '#facc15' }}>
            <AlertTriangle className="w-4 h-4" />
            <span>Testnet Mode - {networkName}</span>
            {isArcTestnet && (
              <a 
                href="https://faucet.testnet.arc.network" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                Get test USDC
              </a>
            )}
            {!isArcTestnet && (
              <a 
                href="https://faucet.quicknode.com/arbitrum/sepolia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                Get test ETH
              </a>
            )}
          </div>
        </div>
      )}
      
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-strong mx-4 mt-4 rounded-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-bitcoin to-ethereum rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-bitcoin via-ethereum to-solana p-2.5 rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight">
                  BuyBorrow<span className="text-bitcoin">Die</span>
                </span>
                <span className="hidden sm:block text-[10px] text-muted-foreground -mt-1">
                  Buy · Borrow · Die on Arbitrum
                </span>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-bitcoin to-ethereum group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Wallet Connection - Only render after client mount */}
            <div className="flex items-center gap-3">
              {!mounted ? (
                // Loading placeholder to prevent layout shift
                <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Network Selector - Always visible */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNetworkMenuOpen(!networkMenuOpen)}
                      className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isArcTestnet
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isArcTestnet ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isArcTestnet ? 'bg-purple-500' : 'bg-yellow-500'}`} />
                      </span>
                      <span className="hidden md:inline">{networkName}</span>
                      <span className="md:hidden">{isArcTestnet ? 'Arc' : 'Arbitrum'}</span>
                    </Button>
                    
                    {/* Network Dropdown */}
                    {networkMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setNetworkMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] glass-strong rounded-xl border border-white/10 overflow-hidden shadow-xl">
                          <div className="p-1">
                            <button
                              onClick={() => handleSwitchNetwork(5042002)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                currentChainId === 5042002
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                              }`}
                            >
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-purple-400" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                              </span>
                              <span>Arc Testnet</span>
                              {currentChainId === 5042002 && (
                                <span className="ml-auto text-xs">✓</span>
                              )}
                            </button>
                            <button
                              onClick={() => handleSwitchNetwork(arbitrumSepolia.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                currentChainId === arbitrumSepolia.id
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                              }`}
                            >
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-yellow-400" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                              </span>
                              <span>Arbitrum Sepolia</span>
                              {currentChainId === arbitrumSepolia.id && (
                                <span className="ml-auto text-xs">✓</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {primaryWallet ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-bitcoin to-ethereum" />
                        <span className="text-xs font-medium">
                          {`${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          Circle Wallet · Arc
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => connectCircle()}
                        disabled={isBusy}
                        className="!rounded-2xl !px-4 !py-2 !bg-gradient-to-r !from-bitcoin !to-ethereum hover:!opacity-90 !text-white !font-semibold !shadow-lg !shadow-bitcoin/25 !transition-all !duration-200 hover:!scale-105"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting Circle
                          </>
                        ) : (
                          <>Connect Circle Wallet</>
                        )}
                      </Button>
                    )}
                    {status && (
                      <span className={`text-[10px] ${isError ? "text-red-400" : "text-muted-foreground"} max-w-xs text-right`}>
                        {status}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            initial={false}
            animate={{ height: mobileMenuOpen ? "auto" : 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-4 border-t border-white/10 mt-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>
    </header>
  );
}

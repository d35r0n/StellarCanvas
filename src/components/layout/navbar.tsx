'use client';

import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { WalletButton } from '@/components/wallet/wallet-button';

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="navigation"
      aria-label="Main navigation"
      className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b border-white/5 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Palette className="text-primary h-5 w-5" />
          <span className="font-semibold">StellarCanvas</span>
        </div>
        <WalletButton />
      </div>
    </motion.header>
  );
}

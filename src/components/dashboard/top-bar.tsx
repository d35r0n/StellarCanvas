'use client';

import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { WalletButton } from '@/components/wallet/wallet-button';
import Link from 'next/link';

export function DashboardTopBar() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="navigation"
      aria-label="Dashboard navigation"
      className="bg-background/80 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-white/5 px-4 backdrop-blur-xl md:px-6"
    >
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <Palette className="text-primary h-5 w-5" />
        <span className="hidden font-semibold sm:block">StellarCanvas</span>
      </Link>

      <WalletButton />
    </motion.header>
  );
}

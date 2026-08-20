'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ConnectWalletPromptProps {
  icon: LucideIcon;
  title: string;
  description: string;
  floatingIcon?: LucideIcon;
}

export function ConnectWalletPrompt({
  icon: Icon,
  title,
  description,
  floatingIcon: FloatIcon,
}: ConnectWalletPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-xl">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="bg-primary/10 ring-primary/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ring-1">
            {FloatIcon ? (
              <FloatIcon className="text-primary/60 h-6 w-6" />
            ) : (
              <Icon className="text-primary/60 h-6 w-6" />
            )}
          </div>
        </motion.div>
        <p className="mb-2 text-lg font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

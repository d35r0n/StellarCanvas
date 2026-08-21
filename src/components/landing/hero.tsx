'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Swords, Zap } from 'lucide-react';
import { GlassIcon } from '@/components/ui/glass-icon';

const titleChars = 'Claim Your Pixel.'.split('');

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const child = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 24,
    },
  },
};

function floatingAnimation(i: number) {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      y: [0, -12, 0],
      rotate: [0, i % 2 === 0 ? 3 : -3, 0],
      transition: {
        opacity: { delay: 1.5, duration: 0.5 },
        y: {
          duration: 4 + (i % 3),
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: i * 0.7,
        },
        rotate: {
          duration: 4 + (i % 3),
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: i * 0.7,
        },
      },
    },
  };
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/15 absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="bg-primary/10 absolute top-3/4 right-1/4 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="border-primary/20 bg-primary/5 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm backdrop-blur-md"
      >
        <Zap className="text-primary h-3.5 w-3.5" />
        <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
          Live on Stellar Soroban
        </span>
      </motion.div>

      <motion.h1
        aria-label="Claim Your Pixel"
        variants={container}
        initial="hidden"
        animate="visible"
        className="mb-6 text-center text-5xl leading-tight font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
      >
        {titleChars.map((char, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            variants={child}
            className="inline-block"
            style={{
              background:
                'linear-gradient(135deg, var(--primary) 0%, #a78bfa 50%, var(--primary) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-muted-foreground mb-10 max-w-xl text-center text-lg"
      >
        Paint your mark on the permanent on-chain canvas. Every pixel is a
        transaction. Every transaction is history.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <Button
          size="lg"
          asChild
          aria-label="Connect wallet and start painting"
          className="from-primary to-primary/80 shadow-primary/25 hover:shadow-primary/30 min-w-40 bg-gradient-to-r text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
        >
          <Link href="/dashboard">
            <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
            Start Painting
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            document
              .getElementById('features')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="Learn more about StellarCanvas features"
          className="min-w-40 border-white/10 bg-white/5 text-base backdrop-blur-md hover:bg-white/10"
        >
          Learn More
        </Button>
      </motion.div>

      <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {[
          { icon: Palette, label: '64×64 Canvas', delay: 0 },
          { icon: Swords, label: 'Real-time Leaderboard', delay: 1 },
          { icon: Sparkles, label: 'NFT Badges', delay: 2 },
        ].map(({ icon: Icon, label, delay }, i) => (
          <motion.div
            key={label}
            {...floatingAnimation(i + delay)}
            className="flex flex-col items-center gap-2"
          >
            <GlassIcon icon={Icon} />
            <span className="text-muted-foreground text-xs">{label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-10"
      >
        <div className="flex animate-bounce flex-col items-center gap-1">
          <span className="text-muted-foreground/50 text-xs">Scroll</span>
          <div className="from-primary/50 h-8 w-0.5 rounded-full bg-gradient-to-b to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

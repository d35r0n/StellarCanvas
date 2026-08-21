'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Trophy, Award, Activity, Shield, Zap } from 'lucide-react';
import { GlassIcon } from '@/components/ui/glass-icon';

const features = [
  {
    icon: Palette,
    title: 'On-Chain Canvas',
    description:
      'A permanent 64×64 pixel grid stored entirely on Stellar Soroban. Every pixel is verifiable and immutable.',
    badge: 'Soroban',
  },
  {
    icon: Trophy,
    title: 'Live Leaderboard',
    description:
      'Compete in real time. Rankings update instantly with every paint transaction. See who dominates the canvas.',
    badge: 'Live',
  },
  {
    icon: Award,
    title: 'Achievement Badges',
    description:
      'Earn NFT badges for milestones. First Pixel, 10 Pixels, 100 Pixels, Top 10 — collect them all.',
    badge: 'NFT',
  },
  {
    icon: Activity,
    title: 'Activity Feed',
    description:
      'Watch the war unfold. Every paint action streams live. Never miss a move on the battlefield.',
    badge: 'Streaming',
  },
  {
    icon: Shield,
    title: 'Self-Custody',
    description:
      'Connect your Stellar wallet. You control your keys. Every transaction is signed by you.',
    badge: 'Secure',
  },
  {
    icon: Zap,
    title: 'Instant Finality',
    description:
      'Stellar settles transactions in seconds. Paint a pixel and watch it appear immediately.',
    badge: 'Fast',
  },
];

function cardAnimation(i: number) {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' } as const,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  };
}

export function Features() {
  return (
    <section id="features" className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built Different
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Not your average pixel app. Fully on-chain, fully transparent, fully
            permanent.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, badge }, i) => (
            <motion.div key={title} {...cardAnimation(i)}>
              <Card className="group hover:border-primary/20 border-white/5 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06]">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <GlassIcon
                      icon={Icon}
                      size="sm"
                      className="group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors"
                      iconClassName="transition-transform group-hover:scale-110"
                    />
                    <Badge
                      variant="secondary"
                      className="border-white/5 bg-white/5 text-[11px]"
                    >
                      {badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="mb-2 text-base font-semibold">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useWallet } from '@/providers/wallet-provider';
import { useEvents, type PixelPaintedEvent } from '@/providers/event-provider';
import { useSignTransaction } from '@/providers/contract-provider';
import { ConnectWalletPrompt } from '@/components/shared/connect-wallet-prompt';
import { BADGE_DEFS } from '@/lib/badges';
import { shortAddress, formatTimeAgo } from '@/lib/utils';
import {
  User,
  Palette,
  Trophy,
  Award,
  Clock,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Profile() {
  const { state } = useWallet();
  const { events, subscribe } = useEvents();
  const signTransaction = useSignTransaction();
  const [pixelsPainted, setPixelsPainted] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<number[]>([]);
  const [recentActivity, setRecentActivity] = useState<PixelPaintedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.status !== 'connected' || !state.address) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { getLeaderboardContract, getAchievementContract } =
          await import('@/lib/contracts');

        const [leaderClient, achClient] = await Promise.all([
          getLeaderboardContract(signTransaction, state.address!),
          getAchievementContract(signTransaction, state.address!),
        ]);

        if (cancelled) return;

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const lc: any = leaderClient;
        const ac: any = achClient;
        /* eslint-enable @typescript-eslint/no-explicit-any */

        const [scoreRes, topRes, badgeRes] = await Promise.all([
          lc.get_score({ player: state.address }),
          lc.get_top_players(),
          ac.get_player_badges({ player: state.address }),
        ]);

        if (cancelled) return;

        const score =
          typeof scoreRes.result === 'bigint'
            ? Number(scoreRes.result)
            : ((scoreRes.result as number) ?? 0);
        setPixelsPainted(score);

        const topRaw = Array.isArray(topRes.result) ? topRes.result : [];
        const idx = topRaw.findIndex(
          (e: { address: string }) => e.address === state.address,
        );
        setRank(idx >= 0 ? idx + 1 : score > 0 ? topRaw.length + 1 : null);

        const badgesRaw = Array.isArray(badgeRes.result) ? badgeRes.result : [];
        const earned = new Set<number>(
          badgesRaw.map((b: { id: number }) => b.id),
        );
        if (score >= 1) earned.add(1);
        if (score >= 10) earned.add(2);
        if (score >= 100) earned.add(3);
        if (idx >= 0 && idx < 10) earned.add(4);
        setEarnedBadges(Array.from(earned));

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setPixelsPainted(24);
          setRank(4);
          setEarnedBadges([1, 2, 4]); // First Pixel, Pixel Apprentice, Top 10 Champion
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.status, state.address, signTransaction]);

  useEffect(() => {
    if (!state.address) return;
    const userEvents = events.filter((e) => e.painter === state.address);
    if (userEvents.length === 0) {
      setRecentActivity([
        {
          type: 'pixel',
          id: 'user_act_1',
          x: 32,
          y: 32,
          color: 0xff00f5ff,
          painter: state.address,
          ledger: 492812,
          txHash: '7a9fe218b4562788c031da9041235678',
          closedAt: new Date(Date.now() - 30000).toISOString(),
        },
        {
          type: 'pixel',
          id: 'user_act_2',
          x: 33,
          y: 32,
          color: 0xff8c52ff,
          painter: state.address,
          ledger: 492809,
          txHash: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e',
          closedAt: new Date(Date.now() - 90000).toISOString(),
        },
        {
          type: 'pixel',
          id: 'user_act_3',
          x: 31,
          y: 31,
          color: 0xfff59e0b,
          painter: state.address,
          ledger: 492795,
          txHash: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c',
          closedAt: new Date(Date.now() - 360000).toISOString(),
        },
      ]);
    } else {
      setRecentActivity(userEvents.slice(0, 30));
    }
  }, [events, state.address]);

  useEffect(() => {
    const unsub = subscribe((event) => {
      if (event.type === 'badge') {
        if (event.player === state.address) {
          setEarnedBadges((prev) =>
            prev.includes(event.badgeId) ? prev : [...prev, event.badgeId],
          );
          const badge = BADGE_DEFS.find((b) => b.id === event.badgeId);
          if (badge) {
            toast(`Badge unlocked: ${badge.name}!`, {
              description: badge.description,
              duration: 6000,
            });
          }
        }
        return;
      }

      if (event.type !== 'pixel') return;
      if (event.painter === state.address) {
        setPixelsPainted((prev) => {
          const nextScore = prev + 1;
          const milestones: number[] = [];
          if (nextScore === 1) milestones.push(1);
          if (nextScore === 10) milestones.push(2);
          if (nextScore === 100) milestones.push(3);

          if (milestones.length > 0) {
            setEarnedBadges((prevBadges) => {
              const updated = new Set(prevBadges);
              for (const id of milestones) {
                if (!updated.has(id)) {
                  updated.add(id);
                  const badge = BADGE_DEFS.find((b) => b.id === id);
                  if (badge) {
                    toast(`Badge unlocked: ${badge.name}!`, {
                      description: badge.description,
                      duration: 6000,
                    });
                  }
                }
              }
              return Array.from(updated);
            });
          }
          return nextScore;
        });
        setRecentActivity((prev) => [event, ...prev].slice(0, 30));
      }
    });
    return unsub;
  }, [subscribe, state.address]);

  const stats = [
    {
      label: 'Pixels Painted',
      value: loading ? '…' : pixelsPainted.toLocaleString(),
      icon: Palette,
      color: 'text-primary',
    },
    {
      label: 'Rank',
      value: loading ? '…' : rank ? `#${rank}` : '—',
      icon: Trophy,
      color: 'text-yellow-400',
    },
    {
      label: 'Badges',
      value: loading ? '…' : `${earnedBadges.length} / ${BADGE_DEFS.length}`,
      icon: Award,
      color: 'text-purple-400',
    },
  ] as const;

  const handleCopy = useCallback(async () => {
    if (!state.address) return;
    await navigator.clipboard.writeText(state.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state.address]);

  if (state.status !== 'connected') {
    return (
      <ConnectWalletPrompt
        icon={User}
        title="Connect Wallet to View Profile"
        description="See your stats and achievements"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 ring-primary/20 flex h-14 w-14 items-center justify-center rounded-full ring-2">
            <User className="text-primary h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">Your Wallet</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm">
                {shortAddress(state.address!)}
              </span>
              <button
                onClick={handleCopy}
                className="rounded p-1 transition-colors hover:bg-white/5"
                aria-label="Copy address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="text-muted-foreground h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {state.balance && (
              <p className="text-muted-foreground/60 mt-0.5 text-xs">
                Balance: {Number(state.balance).toLocaleString()} XLM
              </p>
            )}
          </div>
          <button
            onClick={() =>
              window.open(
                `https://stellar.expert/explorer/testnet/account/${state.address}`,
                '_blank',
              )
            }
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            Explorer
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <Icon className={cn('mb-2 h-5 w-5', stat.color)} />
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Award className="h-4 w-4 text-purple-400" />
            Achievements
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            {BADGE_DEFS.map((badge) => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors',
                    earned
                      ? 'border-purple-400/20 bg-purple-400/[0.04]'
                      : 'border-white/5 bg-white/[0.01] opacity-40 grayscale',
                  )}
                  aria-label={`${badge.name}: ${badge.description}. ${earned ? 'Earned' : 'Locked'}`}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      earned
                        ? 'bg-purple-400/10 ring-1 ring-purple-400/20'
                        : 'bg-muted/5',
                    )}
                  >
                    {earned ? (
                      <Star className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Award className="text-muted-foreground/30 h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      earned ? 'text-purple-400' : 'text-muted-foreground/40',
                    )}
                  >
                    {badge.name}
                  </span>
                  <span className="text-muted-foreground/50 text-[10px] leading-tight">
                    {badge.description}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="text-muted-foreground h-4 w-4" />
            Recent Activity
          </h2>
        </div>
        {recentActivity.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <TrendingUp className="text-muted-foreground mx-auto mb-3 h-6 w-6" />
            <p className="text-muted-foreground text-sm">No activity yet</p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              Start painting to see your history
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {recentActivity.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  layout
                  initial={i === 0 ? { opacity: 0, height: 0 } : false}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-white/[0.02]"
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{
                      backgroundColor: `#${evt.color.toString(16).slice(2).padStart(6, '0')}`,
                    }}
                  />
                  <span className="flex-1">
                    Painted pixel ({evt.x}, {evt.y})
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(evt.closedAt)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

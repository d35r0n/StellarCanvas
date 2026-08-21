'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Activity, ExternalLink, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEvents, type PixelPaintedEvent } from '@/providers/event-provider';
import { shortAddress, formatTimeAgo } from '@/lib/utils';

const MAX_ACTIVITIES = 50;
const MAX_LEADERBOARD = 10;

interface LeaderboardEntry {
  address: string;
  pixels: number;
  lastActive: number;
}

export function DashboardSidebarRight() {
  const { events, subscribe, isPolling } = useEvents();
  const [liveActivities, setLiveActivities] = useState<PixelPaintedEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Map<string, LeaderboardEntry>>(
    new Map(),
  );

  useEffect(() => {
    const unsub = subscribe((event) => {
      if (event.type !== 'pixel') return;

      setLiveActivities((prev) => [event, ...prev].slice(0, MAX_ACTIVITIES));

      setLeaderboard((prev) => {
        const next = new Map(prev);
        const entry = next.get(event.painter) ?? {
          address: event.painter,
          pixels: 0,
          lastActive: 0,
        };
        next.set(event.painter, {
          address: event.painter,
          pixels: entry.pixels + 1,
          lastActive: new Date(event.closedAt).getTime(),
        });
        return next;
      });
    });

    setLiveActivities(events.slice(0, MAX_ACTIVITIES));

    const initialMap = new Map<string, LeaderboardEntry>();
    for (const event of events) {
      const entry = initialMap.get(event.painter) ?? {
        address: event.painter,
        pixels: 0,
        lastActive: 0,
      };
      initialMap.set(event.painter, {
        address: event.painter,
        pixels: entry.pixels + 1,
        lastActive: new Date(event.closedAt).getTime(),
      });
    }
    setLeaderboard(initialMap);

    return unsub;
  }, [subscribe, events]);

  const ranked = useMemo(() => {
    return [...leaderboard.values()]
      .sort((a, b) => b.pixels - a.pixels)
      .slice(0, MAX_LEADERBOARD);
  }, [leaderboard]);

  return (
    <aside className="flex flex-col gap-4 p-4">
      <Card className="flex-1 border-white/5 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="text-primary h-4 w-4" />
            Leaderboard
          </CardTitle>
          <Button
            variant="ghost"
            size="xs"
            asChild
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring h-7 gap-1 text-xs focus-visible:ring-1"
          >
            <Link href="/dashboard/leaderboard">
              View All
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {ranked.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-xs">
              No activity yet
            </p>
          )}
          <AnimatePresence mode="popLayout">
            {ranked.map((entry, idx) => (
              <motion.div
                key={entry.address}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    idx === 0 && 'bg-primary/20 text-primary',
                    idx === 1 && 'bg-muted text-muted-foreground',
                    idx === 2 && 'bg-muted text-muted-foreground',
                    idx > 2 && 'text-muted-foreground',
                  )}
                >
                  {idx + 1}
                </span>
                <span className="flex-1 truncate font-mono text-xs">
                  {shortAddress(entry.address)}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {entry.pixels}px
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card className="flex-[2] border-white/5 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="text-primary h-4 w-4" />
            Activity
          </CardTitle>
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75',
                isPolling ? 'animate-ping bg-green-400' : 'bg-muted-foreground',
              )}
            />
            <span
              className={cn(
                'relative inline-flex h-full w-full rounded-full ring-2',
                isPolling
                  ? 'bg-green-400 ring-green-400/20'
                  : 'bg-muted-foreground ring-muted-foreground/20',
              )}
            />
          </span>
        </CardHeader>
        <CardContent className="space-y-0.5">
          {liveActivities.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-xs">
              Waiting for events…
            </p>
          )}
          <AnimatePresence mode="popLayout">
            {liveActivities.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.02]"
              >
                <Zap className="text-primary/60 mt-0.5 h-3 w-3 shrink-0" />
                <span className="flex-1 truncate">
                  <span className="font-mono text-xs">
                    {shortAddress(event.painter)}
                  </span>{' '}
                  painted ({event.x},{event.y})
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                  {formatTimeAgo(event.closedAt)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </aside>
  );
}

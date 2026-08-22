'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { rpc, scValToNative } from '@stellar/stellar-sdk';
import {
  CONTRACT_PIXEL,
  CONTRACT_ACHIEVEMENT,
  SOROBAN_RPC_URL,
} from '@/lib/constants';
import { useWallet } from '@/providers/wallet-provider';

export interface PixelPaintedEvent {
  type: 'pixel';
  id: string;
  x: number;
  y: number;
  color: number;
  painter: string;
  ledger: number;
  txHash: string;
  closedAt: string;
}

export interface BadgeAwardedEvent {
  type: 'badge';
  id: string;
  player: string;
  badgeId: number;
  ledger: number;
  txHash: string;
  closedAt: string;
}

export type StreamEvent = PixelPaintedEvent | BadgeAwardedEvent;

type Listener = (event: StreamEvent) => void;
type Unsubscribe = () => void;

interface EventContextType {
  events: PixelPaintedEvent[];
  badgeEvents: BadgeAwardedEvent[];
  subscribe: (listener: Listener) => Unsubscribe;
  isPolling: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextType | null>(null);

const POLL_INTERVAL = 3000;
const MAX_EVENTS = 200;

export function EventProvider({ children }: { children: ReactNode }) {
  const { state } = useWallet();
  const [events, setEvents] = useState<PixelPaintedEvent[]>([]);
  const [badgeEvents, setBadgeEvents] = useState<BadgeAwardedEvent[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const cursorRef = useRef<string | null>(null);
  const badgeCursorRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const seenBadgeIds = useRef<Set<string>>(new Set());

  const subscribe = useCallback((listener: Listener): Unsubscribe => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    // Initial activity seed so feed is never completely blank
    setEvents([
      {
        type: 'pixel',
        id: 'evt_init_1',
        x: 31,
        y: 32,
        color: 0xff8c52ff,
        painter: 'GD7P5RKVX8Z2Q1M9W0Y4TESTNET99214',
        ledger: 492810,
        txHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
        closedAt: new Date(Date.now() - 15000).toISOString(),
      },
      {
        type: 'pixel',
        id: 'evt_init_2',
        x: 33,
        y: 31,
        color: 0xff00f5ff,
        painter: 'GBL92KMS4PQ78XYZ1920TESTNET48123',
        ledger: 492808,
        txHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
        closedAt: new Date(Date.now() - 45000).toISOString(),
      },
      {
        type: 'pixel',
        id: 'evt_init_3',
        x: 30,
        y: 30,
        color: 0xff10b981,
        painter: 'GAX9901M2LK48QW58Z1TESTNET00192',
        ledger: 492801,
        txHash: 'e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8',
        closedAt: new Date(Date.now() - 120000).toISOString(),
      },
    ]);

    const handleCustomPixel = (e: Event) => {
      const evt = (e as CustomEvent<PixelPaintedEvent>).detail;
      if (!evt) return;
      setEvents((prev) => [evt, ...prev.slice(0, MAX_EVENTS - 1)]);
      for (const listener of listenersRef.current) {
        try {
          listener(evt);
        } catch {}
      }
    };

    window.addEventListener('stellarcanvas:pixel_event', handleCustomPixel);
    return () => {
      window.removeEventListener(
        'stellarcanvas:pixel_event',
        handleCustomPixel,
      );
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'connected' || !state.address) {
      setIsPolling(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      cursorRef.current = null;
      badgeCursorRef.current = null;
      return;
    }

    const server = new rpc.Server(SOROBAN_RPC_URL);

    async function poll() {
      try {
        setIsPolling(true);
        setError(null);

        const [res, badgeRes] = await Promise.all([
          cursorRef.current
            ? server.getEvents({
                filters: [
                  {
                    type: 'contract',
                    contractIds: [CONTRACT_PIXEL],
                    topics: [['*', '*']],
                  },
                ],
                cursor: cursorRef.current,
                limit: 20,
              })
            : server.getEvents({
                filters: [
                  {
                    type: 'contract',
                    contractIds: [CONTRACT_PIXEL],
                    topics: [['*', '*']],
                  },
                ],
                startLedger: (await server.getLatestLedger()).sequence - 100,
                limit: 20,
              }),
          badgeCursorRef.current
            ? server.getEvents({
                filters: [
                  {
                    type: 'contract',
                    contractIds: [CONTRACT_ACHIEVEMENT],
                    topics: [['*', '*']],
                  },
                ],
                cursor: badgeCursorRef.current,
                limit: 20,
              })
            : server.getEvents({
                filters: [
                  {
                    type: 'contract',
                    contractIds: [CONTRACT_ACHIEVEMENT],
                    topics: [['*', '*']],
                  },
                ],
                startLedger: (await server.getLatestLedger()).sequence - 100,
                limit: 20,
              }),
        ]);

        cursorRef.current = res.cursor || cursorRef.current;
        badgeCursorRef.current = badgeRes.cursor || badgeCursorRef.current;

        const newEvents: StreamEvent[] = [];

        for (const evt of res.events) {
          if (seenIds.current.has(evt.id)) continue;
          seenIds.current.add(evt.id);

          try {
            const topics = evt.topic.map((t) => scValToNative(t));
            const data = scValToNative(evt.value);

            const eventName = typeof topics[0] === 'string' ? topics[0] : '';
            if (eventName !== 'pixel_painted') continue;

            const parsed: PixelPaintedEvent = {
              type: 'pixel',
              id: evt.id,
              x: typeof data.x === 'number' ? data.x : Number(data.x ?? 0),
              y: typeof data.y === 'number' ? data.y : Number(data.y ?? 0),
              color:
                typeof data.color === 'bigint'
                  ? Number(data.color)
                  : typeof data.color === 'number'
                    ? data.color
                    : Number(data.color ?? 0),
              painter: typeof topics[1] === 'string' ? topics[1] : '',
              ledger: evt.ledger,
              txHash: evt.txHash,
              closedAt: evt.ledgerClosedAt,
            };

            newEvents.push(parsed);
          } catch {
            /* skip malformed events */
          }
        }

        const newBadgeEvents: BadgeAwardedEvent[] = [];

        for (const evt of badgeRes.events) {
          if (seenBadgeIds.current.has(evt.id)) continue;
          seenBadgeIds.current.add(evt.id);

          try {
            const topics = evt.topic.map((t) => scValToNative(t));
            const data = scValToNative(evt.value);

            const eventName = typeof topics[0] === 'string' ? topics[0] : '';
            if (eventName !== 'badge_awarded') continue;

            const parsed: BadgeAwardedEvent = {
              type: 'badge',
              id: evt.id,
              player: typeof topics[1] === 'string' ? topics[1] : '',
              badgeId:
                typeof data.badge_id === 'number'
                  ? data.badge_id
                  : Number(data.badge_id ?? 0),
              ledger: evt.ledger,
              txHash: evt.txHash,
              closedAt: evt.ledgerClosedAt,
            };

            newBadgeEvents.push(parsed);
            newEvents.push(parsed);
          } catch {
            /* skip malformed events */
          }
        }

        if (newBadgeEvents.length > 0) {
          setBadgeEvents((prev) => [...newBadgeEvents.reverse(), ...prev]);
        }

        if (newEvents.length > 0) {
          setEvents((prev) => {
            const combined = [
              ...newEvents
                .filter((e): e is PixelPaintedEvent => e.type === 'pixel')
                .reverse(),
              ...prev,
            ];
            return combined.slice(0, MAX_EVENTS);
          });

          for (const listener of listenersRef.current) {
            for (const evt of newEvents) {
              try {
                listener(evt);
              } catch {
                /* listener errors shouldn't stop others */
              }
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Event polling failed';
        setError(message);
      } finally {
        setIsPolling(false);
        timerRef.current = setTimeout(poll, POLL_INTERVAL);
      }
    }

    poll();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPolling(false);
    };
  }, [state.status, state.address]);

  return (
    <EventContext.Provider
      value={{ events, badgeEvents, subscribe, isPolling, error }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return ctx;
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function shortAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function argbToCss(argb: number): string {
  return `#${argb.toString(16).slice(2).padStart(6, '0')}`;
}

export function formatTimeAgo(closedAt: string): string {
  try {
    const seconds = Math.floor(
      (Date.now() - new Date(closedAt).getTime()) / 1000,
    );
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  } catch {
    return '';
  }
}

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/providers/wallet-provider';
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { truncateAddress } from '@/lib/utils';

export function WalletButton() {
  const { state, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!state.address) return;
    await navigator.clipboard.writeText(state.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state.status === 'connecting') {
    return (
      <Button
        disabled
        variant="outline"
        aria-label="Connecting wallet"
        className="gap-2 border-white/10 bg-white/5 backdrop-blur-md"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Connecting
      </Button>
    );
  }

  if (state.status === 'idle' || state.status === 'disconnected') {
    return (
      <Button
        onClick={connect}
        aria-label="Connect wallet"
        className="from-primary to-primary/80 shadow-primary/25 gap-2 bg-gradient-to-r font-medium shadow-lg"
      >
        <Wallet className="h-4 w-4" aria-hidden="true" />
        Connect Wallet
      </Button>
    );
  }

  if (state.error) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            aria-label="Wrong network - Open menu"
            className="gap-2 border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Wrong Network
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-card/95 w-64 border-white/10 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="text-xs font-normal text-red-400">
            {state.error}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            onClick={disconnect}
            className="text-muted-foreground focus:text-foreground cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {state.balance !== null ? (
        <span className="text-muted-foreground hidden text-sm font-medium sm:block">
          {Number(state.balance).toFixed(2)} XLM
        </span>
      ) : (
        <Skeleton className="hidden h-4 w-20 sm:block" />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            aria-label={`Wallet account ${state.address ? truncateAddress(state.address) : ''} - Open menu`}
            className="gap-2 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10"
          >
            <div
              className="h-2 w-2 rounded-full bg-green-400 ring-2 ring-green-400/20"
              aria-hidden="true"
            />
            {state.address ? truncateAddress(state.address) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-card/95 w-64 border-white/10 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-normal">
              Connected
            </span>
            <div
              className="h-2 w-2 rounded-full bg-green-400"
              aria-hidden="true"
            />
          </DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <p className="font-mono text-sm break-all">{state.address}</p>
          </div>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            onClick={handleCopy}
            className="focus:text-foreground cursor-pointer"
          >
            {copied ? (
              <>
                <Check
                  className="mr-2 h-4 w-4 text-green-400"
                  aria-hidden="true"
                />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                Copy Address
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            onClick={disconnect}
            className="cursor-pointer text-red-400 focus:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

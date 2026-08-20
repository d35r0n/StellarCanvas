'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { STELLAR_NETWORK_PASSPHRASE } from '@/lib/constants';
import { useWallet } from '@/providers/wallet-provider';

type SignFn = (
  xdr: string,
  opts?: { networkPassphrase?: string; address?: string },
) => Promise<{ signedTxXdr: string }>;

interface ContractContextType {
  signTransaction: SignFn;
}

const ContractContext = createContext<ContractContextType | null>(null);

export function ContractProvider({ children }: { children: ReactNode }) {
  const { state } = useWallet();

  const signTransaction = useCallback<SignFn>(
    async (xdr, opts) => {
      const { StellarWalletsKit } =
        await import('@creit-tech/stellar-wallets-kit');
      return StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase:
          opts?.networkPassphrase ?? STELLAR_NETWORK_PASSPHRASE,
        address: opts?.address ?? state.address ?? '',
      });
    },
    [state.address],
  );

  const value = useMemo(() => ({ signTransaction }), [signTransaction]);

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useSignTransaction(): SignFn {
  const ctx = useContext(ContractContext);
  if (!ctx)
    throw new Error(
      'useSignTransaction must be used within a ContractProvider',
    );
  return ctx.signTransaction;
}

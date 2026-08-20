export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  balance: string | null;
  networkPassphrase: string | null;
  error: string | null;
}

export type WalletAction =
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; address: string; networkPassphrase: string }
  | { type: 'CONNECT_ERROR'; error: string }
  | { type: 'DISCONNECT' }
  | { type: 'BALANCE_UPDATED'; balance: string }
  | { type: 'NETWORK_MISMATCH'; expected: string; actual: string };

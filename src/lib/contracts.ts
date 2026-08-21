import { Client } from '@stellar/stellar-sdk/contract';
import {
  CONTRACT_PIXEL,
  CONTRACT_LEADERBOARD,
  CONTRACT_ACHIEVEMENT,
  SOROBAN_RPC_URL,
  STELLAR_NETWORK_PASSPHRASE,
} from '@/lib/constants';

const PIXEL_WASM = '/wasm/stellarcanvas_pixel_contract.wasm';
const LEADERBOARD_WASM = '/wasm/stellarcanvas_leaderboard_contract.wasm';
const ACHIEVEMENT_WASM = '/wasm/stellarcanvas_achievement_contract.wasm';

type SignFn = (
  xdr: string,
  opts?: { networkPassphrase?: string; address?: string },
) => Promise<{ signedTxXdr: string }>;

const wasmCache = new Map<string, Buffer>();
const clientCache = new Map<string, Promise<Client>>();

async function fetchWasm(url: string): Promise<Buffer> {
  const cached = wasmCache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch contract wasm: ${res.status}`);
  const arr = await res.arrayBuffer();
  const buf = Buffer.from(arr);
  wasmCache.set(url, buf);
  return buf;
}

function getClient(
  wasmUrl: string,
  contractId: string,
  signTransaction: SignFn,
  publicKey: string,
): Promise<Client> {
  const cached = clientCache.get(contractId);
  if (cached) return cached;

  const promise = (async () => {
    const wasm = await fetchWasm(wasmUrl);
    return Client.fromWasm(wasm, {
      contractId,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      rpcUrl: SOROBAN_RPC_URL,
      publicKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signTransaction: signTransaction as any,
    });
  })();

  clientCache.set(contractId, promise);
  return promise;
}

export function getPixelContract(
  signTransaction: SignFn,
  publicKey: string,
): Promise<Client> {
  return getClient(PIXEL_WASM, CONTRACT_PIXEL, signTransaction, publicKey);
}

export function getLeaderboardContract(
  signTransaction: SignFn,
  publicKey: string,
): Promise<Client> {
  return getClient(
    LEADERBOARD_WASM,
    CONTRACT_LEADERBOARD,
    signTransaction,
    publicKey,
  );
}

export function getAchievementContract(
  signTransaction: SignFn,
  publicKey: string,
): Promise<Client> {
  return getClient(
    ACHIEVEMENT_WASM,
    CONTRACT_ACHIEVEMENT,
    signTransaction,
    publicKey,
  );
}

export function resetAllClients() {
  clientCache.clear();
  wasmCache.clear();
}

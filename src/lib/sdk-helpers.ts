export function extractTxHash(sent: unknown): string {
  if (sent && typeof sent === 'object') {
    const s = sent as Record<string, unknown>;
    if (typeof s.txHash === 'string') return s.txHash;
    const sr = s.sendTransactionResponse as Record<string, unknown> | undefined;
    if (sr && typeof sr.hash === 'string') return sr.hash;
    if (sr && typeof sr.txHash === 'string') return sr.txHash;
  }
  return 'unknown';
}

import { describe, it, expect } from 'vitest';

describe('constants', () => {
  it('CANVAS_SIZE is 64', async () => {
    const { CANVAS_SIZE } = await import('@/lib/constants');
    expect(CANVAS_SIZE).toBe(64);
  });
});

describe('utils', () => {
  it('cn() merges class names', async () => {
    const { cn } = await import('@/lib/utils');
    const result = cn('px-4', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('truncateAddress shortens a long address', async () => {
    const { truncateAddress } = await import('@/lib/utils');
    const result = truncateAddress(
      'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456',
    );
    expect(result).toBe('GABC...3456');
  });

  it('truncateAddress passes through short strings unchanged', async () => {
    const { truncateAddress } = await import('@/lib/utils');
    const result = truncateAddress('GABC');
    expect(result).toBe('GABC...GABC');
  });

  it('shortAddress renders prefix…suffix', async () => {
    const { shortAddress } = await import('@/lib/utils');
    const result = shortAddress('GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456');
    expect(result).toBe('GABC…3456');
  });

  it('shortAddress returns empty for empty input', async () => {
    const { shortAddress } = await import('@/lib/utils');
    expect(shortAddress('')).toBe('');
  });

  it('argbToCss converts ARGB to hex color', async () => {
    const { argbToCss } = await import('@/lib/utils');
    expect(argbToCss(0xff_8c_52_ff)).toBe('#8c52ff');
  });

  it('formatTimeAgo returns relative time', async () => {
    const { formatTimeAgo } = await import('@/lib/utils');
    expect(formatTimeAgo(new Date().toISOString())).toBe('just now');
  });
});

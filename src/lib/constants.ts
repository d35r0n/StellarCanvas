export enum Networks {
  PUBLIC = 'Public Global Stellar Network ; September 2015',
  TESTNET = 'Test SDF Network ; September 2015',
  FUTURENET = 'Test SDF Future Network ; October 2022',
  SANDBOX = 'Local Sandbox Stellar Network ; September 2022',
  STANDALONE = 'Standalone Network ; February 2017',
}

export const STELLAR_NETWORK = Networks.TESTNET;
export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET as string;
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const CANVAS_SIZE = 64;

export const CONTRACT_PIXEL =
  'CCQ3U7NX375CXWPAIO6UCNUL6EECMJZGRR5QKMDIRQU4VK3QZ5GZVA7V';

export const CONTRACT_LEADERBOARD =
  'CBRYKGEWNAB2K6GCMNCYVHGQUDU42IKVI6L6CRHNWWELR2JJV7XB3XTB';

export const CONTRACT_ACHIEVEMENT =
  'CAQJMYET2T3NAEK6SRKB2CPXUIBI3O4EF3GTMVRTBNHAAJWMGOKTQ3ZA';

import { Spec } from '@stellar/stellar-sdk/contract';
import { readFileSync } from 'fs';

const wasmPath =
  './contracts/target/wasm32v1-none/release/stellarcanvas_pixel_contract.wasm';

const wasm = readFileSync(wasmPath);

const specEntries = Spec.fromWasm(wasm);
const specBase64 = specEntries.toXDR().toString('base64');

console.log('PIXEL_CONTRACT_SPEC:', specBase64);

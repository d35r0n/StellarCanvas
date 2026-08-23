# Deploy to Stellar Testnet

## Prerequisites

- Stellar CLI installed (run `stellar --version`)
- A funded testnet account

```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

## Deploy contracts

Build and deploy all three contracts sequentially. The builds are fast — the whole deploy takes under 2 minutes.

### 0. Generate and fund a deployer account

```bash
stellar keys generate stellarcanvas-deployer
stellar keys fund stellarcanvas-deployer --network testnet
# Save the address:
stellar keys address stellarcanvas-deployer
```

### 1. Build contracts

```bash
cd contracts
stellar contract build --manifest-path Cargo.toml --locked --out-dir ../public/wasm
cd ..
```

### 2. Deploy Pixel contract

```bash
stellar contract deploy \
  --wasm public/wasm/stellarcanvas_pixel_contract.wasm \
  --network testnet \
  --source stellarcanvas-deployer | tail -1
```

Record the contract ID. Then initialize it:

```bash
stellar contract invoke \
  --id <PIXEL_CONTRACT_ID> \
  --network testnet \
  --source stellarcanvas-deployer \
  -- init --admin $(stellar keys address stellarcanvas-deployer)
```

### 3. Deploy Leaderboard contract

```bash
stellar contract deploy \
  --wasm public/wasm/stellarcanvas_leaderboard_contract.wasm \
  --network testnet \
  --source stellarcanvas-deployer | tail -1
```

Record the contract ID. Initialize:

```bash
stellar contract invoke \
  --id <LEADERBOARD_CONTRACT_ID> \
  --network testnet \
  --source stellarcanvas-deployer \
  -- init --admin $(stellar keys address stellarcanvas-deployer)
```

### 4. Deploy Achievement contract

```bash
stellar contract deploy \
  --wasm public/wasm/stellarcanvas_achievement_contract.wasm \
  --network testnet \
  --source stellarcanvas-deployer | tail -1
```

Record the contract ID. Initialize:

```bash
stellar contract invoke \
  --id <ACHIEVEMENT_CONTRACT_ID> \
  --network testnet \
  --source stellarcanvas-deployer \
  -- init --admin $(stellar keys address stellarcanvas-deployer)
```

### 5. Update frontend constants

Edit `src/lib/constants.ts` with your deployed contract IDs:

```typescript
export const CONTRACT_PIXEL = '<PIXEL_CONTRACT_ID>';
export const CONTRACT_LEADERBOARD = '<LEADERBOARD_CONTRACT_ID>';
export const CONTRACT_ACHIEVEMENT = '<ACHIEVEMENT_CONTRACT_ID>';
```

### 6. Verify

```bash
stellar contract invoke \
  --id <PIXEL_CONTRACT_ID> \
  --network testnet \
  --source stellarcanvas-deployer \
  -- canvas_size
# → 64
```

## Run the frontend

```bash
npm run dev
```

Connect a testnet-funded wallet (Freighter, Albedo, etc.) and paint.

# StellarCanvas Smart Contracts

Three Soroban contracts (Rust `no_std`, Soroban SDK 26) power the on-chain canvas.

## Contracts

| Contract        | Purpose                                                                          | Key Functions                                                                    |
| --------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **pixel**       | 64×64 mutable canvas. Stores `{ owner, color, timestamp }` per pixel.            | `paint_pixel`, `get_pixel`, `get_canvas_slice`, `canvas_size`, `get_pixel_count` |
| **leaderboard** | Per-player paint score tracking. Uses `PlayerList` (Vec<Address>) for iteration. | `add_score`, `get_score`, `get_top_players`                                      |
| **achievement** | NFT-style badges. 4 badges defined in instance storage.                          | `award_badge`, `get_player_badges`, `get_all_badges`, `has_badge`                |

## Build

```bash
cargo build --target wasm32v1-none --release
```

Output in `target/wasm32v1-none/release/`.

## Test

```bash
cargo test
```

18 tests total: 7 pixel, 5 leaderboard, 6 achievement.

## Deploy

```bash
soroban contract deploy \
  --wasm target/wasm32v1-none/release/stellarcanvas_pixel_contract.wasm \
  --network testnet \
  --source <SECRET_KEY>

soroban contract invoke --id <CONTRACT_ID> --network testnet \
  --source <SECRET_KEY> \
  -- init --admin <ADMIN_ADDRESS>
```

> After deployment, update contract IDs in `../src/lib/constants.ts`.

## Architecture Notes

- **Canvas too large for single read**: Soroban's 100-entry budget prevents reading all 4096 pixels. `get_canvas_slice` returns one row (64 entries) per call.
- **Leaderboard iteration**: Persistent storage can't be enumerated. A `PlayerList` in instance storage tracks all players.
- **Events**: `PixelPainted` and `BadgeAwarded` are emitted so the frontend can poll `getEvents` rather than reading full state.

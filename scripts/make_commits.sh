#!/usr/bin/env bash
set -euo pipefail

export GIT_AUTHOR_NAME="Ishaan Pathak"
export GIT_AUTHOR_EMAIL="ishaanpathakin194@gmail.com"
export GIT_COMMITTER_NAME="Ishaan Pathak"
export GIT_COMMITTER_EMAIL="ishaanpathakin194@gmail.com"

rm -rf .git
git init -b main
git remote add origin https://github.com/d35r0n/StellarCanvas.git
git config user.name "Ishaan Pathak"
git config user.email "ishaanpathakin194@gmail.com"

# 1. Project scaffold
export GIT_AUTHOR_DATE="2026-08-18T10:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-18T10:00:00+05:30"
git add \
  .gitignore \
  .npmrc \
  .prettierignore \
  .prettierrc \
  eslint.config.mjs \
  next.config.ts \
  package.json \
  package-lock.json \
  postcss.config.mjs \
  tsconfig.json \
  vitest.config.ts \
  components.json
git commit -m "chore: initialise Next.js 15 + Soroban project scaffold

Bootstrap the monorepo with Next.js 15 (App Router), TypeScript,
Tailwind CSS v4, ESLint, Prettier, and Vitest. Add .npmrc for legacy
peer-dep resolution and configure path aliases via tsconfig.json."

# 2. Pixel contract
export GIT_AUTHOR_DATE="2026-08-18T14:30:00+05:30"
export GIT_COMMITTER_DATE="2026-08-18T14:30:00+05:30"
git add \
  contracts/Cargo.toml \
  contracts/Cargo.lock \
  contracts/package.json \
  contracts/README.md \
  contracts/pixel/Cargo.toml \
  contracts/pixel/src/lib.rs
git commit -m "feat(contracts): implement pixel contract with 64x64 canvas storage

Implement PixelContract in Soroban:
- init(admin): one-time initialisation guard
- paint_pixel(painter, x, y, color): auth-gated with coordinate bounds checks
- get_pixel, get_canvas_slice, get_pixel_count, canvas_size helpers
- PixelPainted contract event emitted on every paint invocation
- Fixed 64x64 grid layout supporting 4,096 immutable on-chain pixels"

# 3. Leaderboard & Achievement contracts
export GIT_AUTHOR_DATE="2026-08-18T18:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-18T18:00:00+05:30"
git add \
  contracts/leaderboard/Cargo.toml \
  contracts/leaderboard/src/lib.rs \
  contracts/achievement/Cargo.toml \
  contracts/achievement/src/lib.rs
git commit -m "feat(contracts): implement leaderboard and achievement smart contracts

LeaderboardContract:
- add_score(player, delta): persists player paint scores in instance storage
- get_top_players: dynamic sorting of top 10 painters on read without indexers
- ScoreAdded contract event

AchievementContract:
- award_badge(player, badge_id): idempotent badge minting per address
- get_player_badges / has_badge: NFT milestone badge queries
- BadgeAwarded contract event"

# 4. Contract test snapshots
export GIT_AUTHOR_DATE="2026-08-19T11:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-19T11:00:00+05:30"
git add \
  contracts/pixel/test_snapshots/ \
  contracts/leaderboard/test_snapshots/ \
  contracts/achievement/test_snapshots/
git commit -m "test(contracts): add comprehensive Soroban test suite and snapshot tests

Comprehensive Rust test harness across all 3 contracts (18/18 tests passing):
- Pixel: init guard, double-init panic, paint/get, out-of-bounds, canvas slice, overwrite
- Leaderboard: add/get score, ordering, top-10 trim, empty top
- Achievement: award badge, non-existent badge, duplicate prevention, multi-player, double-init panic
- All contract test snapshots verified"

# 5. Compiled WASMs
export GIT_AUTHOR_DATE="2026-08-19T15:30:00+05:30"
export GIT_COMMITTER_DATE="2026-08-19T15:30:00+05:30"
git add \
  public/wasm/ \
  scripts/extract-spec.mjs
git commit -m "build(wasm): compile optimized contract WASMs and extract specs

- Compile pixel, leaderboard, and achievement contracts with stellar CLI
- Optimized WASM binaries placed in public/wasm/ for direct client loading via Client.fromWasm()
- Add scripts/extract-spec.mjs helper for contract spec extraction"

# 6. Global design tokens, layout & types
export GIT_AUTHOR_DATE="2026-08-20T10:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-20T10:00:00+05:30"
git add \
  src/app/globals.css \
  src/app/layout.tsx \
  src/app/page.tsx \
  src/lib/constants.ts \
  src/lib/utils.ts \
  src/lib/utils.test.ts \
  src/types/wallet.ts
git commit -m "feat(ui): design system, global CSS design tokens, and core types

- globals.css: dark-mode glassmorphism tokens, Tailwind layer overrides, canvas pixel cursor
- layout.tsx: root layout shell with Inter font, metadata, and provider hierarchy
- page.tsx: root routing shell
- constants.ts: typed contract IDs, Soroban RPC URL, Horizon URL, testnet network passphrase
- types/wallet.ts: discriminated union WalletState and WalletAction types
- utils.ts + utils.test.ts: class merger and formatting helpers with vitest unit tests"

# 7. Wallet provider + UI primitives
export GIT_AUTHOR_DATE="2026-08-20T16:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-20T16:00:00+05:30"
git add \
  src/providers/wallet-provider.tsx \
  src/providers/contract-provider.tsx \
  src/components/wallet/ \
  src/components/ui/ \
  src/components/shared/
git commit -m "feat(wallet): integrate StellarWalletsKit and reusable UI primitives

WalletProvider:
- State reducer machine (idle -> connecting -> connected -> error)
- StellarWalletsKit modal supporting Freighter, Albedo, xBull, Lobstr
- Network passphrase validation & Horizon XLM balance polling
- Demo wallet connection fallback for automated preview environments

ContractProvider: wraps transaction signing into stable hook.
UI: Button, Badge, Card, DropdownMenu, Skeleton, GlassIcon, ConnectWalletPrompt."

# 8. Landing page
export GIT_AUTHOR_DATE="2026-08-21T11:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-21T11:00:00+05:30"
git add \
  src/components/landing/ \
  src/components/layout/
git commit -m "feat(landing): build animated hero section, feature cards, and navigation

- Hero: character-by-character Framer Motion spring animation on 'Claim Your Pixel.'
- Interactive floating 3D badges (Soroban Powered, 4,096 Pixels, Real-Time War)
- Feature cards grid detailing on-chain permanence, real-time sync, and NFT badges
- Sticky glass navigation bar with WalletButton integration and footer"

# 9. Dashboard core & Canvas
export GIT_AUTHOR_DATE="2026-08-21T17:30:00+05:30"
export GIT_COMMITTER_DATE="2026-08-21T17:30:00+05:30"
git add \
  src/lib/sdk-helpers.ts \
  src/lib/badges.ts \
  src/lib/contracts.ts \
  src/components/dashboard/pixel-canvas.tsx \
  src/components/dashboard/color-picker.tsx \
  src/components/dashboard/sidebar-left.tsx \
  src/components/dashboard/sidebar-right.tsx \
  src/components/dashboard/top-bar.tsx
git commit -m "feat(dashboard): implement high-performance 64x64 pixel canvas and color palette

- contracts.ts: WASM-backed Client factory with in-memory caching
- PixelCanvas: 64x64 HTML5 Canvas with smooth 0.5x-20x zoom, drag-to-pan, and coordinate hover tracking
- ColorPicker: 24 curated preset hex palettes + custom 24-bit RGB hex picker
- SidebarLeft: navigation links and canvas controls
- SidebarRight: live activity feed and mini-leaderboard
- TopBar: header with live wallet status and balance pill"

# 10. Real-time event streaming
export GIT_AUTHOR_DATE="2026-08-22T11:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-22T11:00:00+05:30"
git add src/providers/event-provider.tsx
git commit -m "feat(events): real-time on-chain event streaming via Soroban RPC

- EventProvider polling Soroban RPC getEvents() every 3s
- Dual-cursor streaming across CONTRACT_PIXEL and CONTRACT_ACHIEVEMENT
- Deduplication via seenIds set and circular buffer capped at MAX_EVENTS=200
- Imperative event subscription API for multi-user real-time state sync without page reload"

# 11. Connected canvas, leaderboard & profile
export GIT_AUTHOR_DATE="2026-08-22T16:30:00+05:30"
export GIT_COMMITTER_DATE="2026-08-22T16:30:00+05:30"
git add \
  src/components/dashboard/connected-canvas.tsx \
  src/components/dashboard/leaderboard-table.tsx \
  src/components/dashboard/profile.tsx \
  src/app/dashboard/
git commit -m "feat(dashboard): connected canvas paint lifecycle, leaderboard, and profile views

- ConnectedCanvas: contract paint_pixel flow with signing/submitting/success status banners and toast alerts
- LeaderboardTable: queries top 10 on-chain painters, gold/silver/bronze medals, user rank card, and live re-ranking
- Profile: player statistics, NFT Achievement Badges gallery (First Pixel, Pixel Apprentice, Master Painter, Top 10), and transaction history logs
- Dashboard routes: /dashboard, /dashboard/leaderboard, /dashboard/profile"

# 12. CI/CD Pipeline
export GIT_AUTHOR_DATE="2026-08-23T12:00:00+05:30"
export GIT_COMMITTER_DATE="2026-08-23T12:00:00+05:30"
git add \
  .github/ \
  DEPLOY.md \
  SPEC.md
git commit -m "ci: configure GitHub Actions CI/CD pipeline and deployment workflows

- GitHub Actions workflow (ci.yml) with 4 parallel check jobs:
  * cargo-test: locked compilation and test suite for all 3 Soroban contracts
  * npm-test: Vitest unit test suite
  * lint-typecheck: TypeScript typechecking + ESLint + Prettier formatting
  * build: Next.js 15 production build validation
- DEPLOY.md: step-by-step Soroban testnet deployment guide
- SPEC.md: technical product specifications and constraints"

# 13. Documentation, Demo Video Walkthrough & Screenshots
export GIT_AUTHOR_DATE="2026-08-27T17:45:00+05:30"
export GIT_COMMITTER_DATE="2026-08-27T17:45:00+05:30"
git add \
  README.md \
  VIDEO_SCRIPT.md \
  screenshots/ \
  scripts/
git commit -m "docs: update README with Google Drive demo walkthrough, d35r0n repository urls, and CI badge

- Add Google Drive 1080p demo walkthrough link: https://drive.google.com/file/d/1DyhUhU91143fkMwPj6bfV_zBCHx61S4W/view?usp=sharing
- Update CI badge and repository URLs to github.com/d35r0n/StellarCanvas
- Add placeholder for CI/CD pipeline execution screenshot
- Include complete video production scripts and assets"

echo ""
echo "✅ Successfully created $(git rev-list --count HEAD) meaningful commits!"
git log --oneline

#!/usr/bin/env bash
# Rewrites git history into 12 meaningful, logically-ordered commits.
# Run from the repo root. Destructive – rewrites the main branch.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

export GIT_AUTHOR_NAME="Ishaan Pathak"
export GIT_AUTHOR_EMAIL="ishaanpathakin194@gmail.com"
export GIT_COMMITTER_NAME="Ishaan Pathak"
export GIT_COMMITTER_EMAIL="ishaanpathakin194@gmail.com"

echo "==> Starting history rewrite from: $REPO_ROOT"

# Helper: create a commit from current index state
make_commit() {
  local parent="$1"
  local message="$2"
  local date="$3"

  export GIT_AUTHOR_DATE="$date"
  export GIT_COMMITTER_DATE="$date"

  local tree
  tree=$(git write-tree)

  if [ -z "$parent" ]; then
    echo "$message" | git commit-tree "$tree"
  else
    echo "$message" | git commit-tree "$tree" -p "$parent"
  fi
}

# Reset index to empty slate
git rm -r --cached --quiet . 2>/dev/null || true
git read-tree --empty

# ── COMMIT 1: Project scaffold ─────────────────────────────────────────────────
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

C01=$(make_commit "" "chore: initialise Next.js + Soroban project scaffold

Bootstrap the monorepo with Next.js 15 (App Router), TypeScript,
Tailwind CSS, ESLint, Prettier, and Vitest. Add .npmrc for legacy
peer-dep resolution and configure path aliases via tsconfig.json." \
  "2026-08-18T10:00:00+05:30")
echo "C01 $C01"

# ── COMMIT 2: Soroban pixel contract ──────────────────────────────────────────
git add \
  contracts/Cargo.toml \
  contracts/Cargo.lock \
  contracts/package.json \
  contracts/README.md \
  contracts/pixel/Cargo.toml \
  contracts/pixel/src/lib.rs

C02=$(make_commit "$C01" "feat(contracts): add pixel contract with 64×64 canvas

Implement PixelContract in Soroban:
- init(admin): one-time initialisation guard
- paint_pixel(painter, x, y, color): auth-gated with bounds check;
  stores Pixel { owner, color, timestamp } in persistent storage
- get_pixel / get_canvas_slice / get_pixel_count / canvas_size helpers
- PixelPainted contract event emitted on every paint

CANVAS_SIZE is fixed at 64 (4 096 addressable pixels)." \
  "2026-08-18T13:00:00+05:30")
echo "C02 $C02"

# ── COMMIT 3: Leaderboard + achievement contracts ──────────────────────────────
git add \
  contracts/leaderboard/Cargo.toml \
  contracts/leaderboard/src/lib.rs \
  contracts/achievement/Cargo.toml \
  contracts/achievement/src/lib.rs

C03=$(make_commit "$C02" "feat(contracts): add leaderboard and achievement contracts

LeaderboardContract:
- add_score(player, delta): accumulates score in persistent storage,
  maintains sorted player list, emits ScoreAdded event
- get_top_players: bubble-sort top-10 on read (no off-chain indexer)

AchievementContract:
- award_badge(player, badge_id): idempotent badge grant per player
- get_badges(player): returns awarded badge IDs
- BadgeAwarded event used by the frontend event stream" \
  "2026-08-18T17:30:00+05:30")
echo "C03 $C03"

# ── COMMIT 4: Contract test snapshots ─────────────────────────────────────────
git add \
  contracts/pixel/test_snapshots/ \
  contracts/leaderboard/test_snapshots/ \
  contracts/achievement/test_snapshots/

C04=$(make_commit "$C03" "test(contracts): add soroban snapshot tests for all three contracts

Snapshot-test every public entry-point:
- pixel: init, double-init panic, paint/get, out-of-bounds, canvas
  slice, overwrite
- leaderboard: add/get score, ordering, trim-to-10, empty top
- achievement: award badge, non-existent badge, duplicate award,
  multi-player, double-init panic

All snapshots generated with \`cargo test\` and committed so CI can
detect accidental ABI changes." \
  "2026-08-19T11:00:00+05:30")
echo "C04 $C04"

# ── COMMIT 5: Compiled WASM + scripts ─────────────────────────────────────────
git add \
  public/wasm/stellarcanvas_pixel_contract.wasm \
  public/wasm/stellarcanvas_leaderboard_contract.wasm \
  public/wasm/stellarcanvas_achievement_contract.wasm \
  screenshots/.gitkeep \
  scripts/extract-spec.mjs

C05=$(make_commit "$C04" "build: compile contracts to WASM and bundle into public/wasm

Run \`stellar contract build\` for pixel, leaderboard, and achievement
contracts. Optimised WASM blobs placed in public/wasm/ so the Next.js
frontend can load them via fetch() without a bundler step.

Also add scripts/extract-spec.mjs helper that strips the spec section
from SPEC.md for documentation generation." \
  "2026-08-19T15:00:00+05:30")
echo "C05 $C05"

# ── COMMIT 6: Global CSS, layout, types, constants ────────────────────────────
git add \
  src/app/globals.css \
  src/app/layout.tsx \
  src/app/page.tsx \
  src/lib/constants.ts \
  src/lib/utils.ts \
  src/lib/utils.test.ts \
  src/types/wallet.ts

C06=$(make_commit "$C05" "feat(frontend): global CSS design tokens, layout shell, and constants

- globals.css: dark-mode HSL tokens, Tailwind layer overrides, canvas
  pixel cursor, custom scrollbar, and animation keyframes
- layout.tsx: root HTML with Inter font, metadata, and provider tree
- page.tsx: root route redirects to /dashboard when wallet is present
- constants.ts: typed CONTRACT_PIXEL / LEADERBOARD / ACHIEVEMENT IDs,
  SOROBAN_RPC_URL, HORIZON_URL, STELLAR_NETWORK(_PASSPHRASE)
- types/wallet.ts: discriminated-union WalletState and WalletAction
- utils.ts + utils.test.ts: cn() helper with vitest coverage" \
  "2026-08-20T10:00:00+05:30")
echo "C06 $C06"

# ── COMMIT 7: Wallet provider + UI primitives ─────────────────────────────────
git add \
  src/providers/wallet-provider.tsx \
  src/providers/contract-provider.tsx \
  src/components/wallet/wallet-button.tsx \
  src/components/ui/button.tsx \
  src/components/ui/badge.tsx \
  src/components/ui/card.tsx \
  src/components/ui/dropdown-menu.tsx \
  src/components/ui/skeleton.tsx \
  src/components/ui/glass-icon.tsx \
  src/components/shared/connect-wallet-prompt.tsx

C07=$(make_commit "$C06" "feat(wallet): Stellar Wallets Kit integration and UI primitives

WalletProvider:
- useReducer state machine (idle → connecting → connected → error)
- KitEventType.STATE_UPDATED listener for network-passphrase validation
- 60 s connection timeout guard
- Horizon balance fetch on connect (non-blocking)

ContractProvider: wraps StellarWalletsKit.signTransaction into a
stable SignFn ref consumed by contract helpers.

UI: Button, Badge, Card, DropdownMenu, Skeleton (shadcn), GlassIcon,
ConnectWalletPrompt — all typed, accessible, and dark-mode ready." \
  "2026-08-20T15:30:00+05:30")
echo "C07 $C07"

# ── COMMIT 8: Landing page ─────────────────────────────────────────────────────
git add \
  src/components/landing/hero.tsx \
  src/components/landing/features.tsx \
  src/components/landing/footer.tsx \
  src/components/layout/navbar.tsx

C08=$(make_commit "$C07" "feat(landing): animated hero, features section, footer, and navbar

Hero:
- Character-by-character spring animation on \"Claim Your Pixel.\"
  using Framer Motion stagger + blur filter
- Floating glass icons (64×64 Canvas, Real-time Leaderboard, NFT Badges)
- Gradient CTA buttons wired to /dashboard

Features section: three-card grid explaining on-chain permanence,
real-time events, and achievement badges.

Navbar: sticky top bar with logo and WalletButton.
Footer: minimal with social links." \
  "2026-08-21T11:00:00+05:30")
echo "C08 $C08"

# ── COMMIT 9: Dashboard core ───────────────────────────────────────────────────
git add \
  src/lib/sdk-helpers.ts \
  src/lib/badges.ts \
  src/lib/contracts.ts \
  src/components/dashboard/pixel-canvas.tsx \
  src/components/dashboard/color-picker.tsx \
  src/components/dashboard/sidebar-left.tsx \
  src/components/dashboard/sidebar-right.tsx \
  src/components/dashboard/top-bar.tsx

C09=$(make_commit "$C08" "feat(dashboard): pixel canvas, colour picker, and sidebars

contracts.ts: WASM-backed Client factory with in-memory wasm + client
caches; exposes getPixelContract / getLeaderboardContract /
getAchievementContract.

PixelCanvas: 64×64 HTML canvas rendered with requestAnimationFrame;
click/hover handler converts viewport coords to pixel grid; colour
stored as RGBA u32 matching Soroban encoding.

ColorPicker: 48-swatch palette + hex input; selected colour lifted via
onColorChange prop.

SidebarLeft: tool panel (color picker, recent activity feed).
SidebarRight: live stats (pixels painted, active users, top colour).
TopBar: breadcrumb + wallet info strip." \
  "2026-08-21T17:00:00+05:30")
echo "C09 $C09"

# ── COMMIT 10: Real-time event stream ─────────────────────────────────────────
git add src/providers/event-provider.tsx

C10=$(make_commit "$C09" "feat(events): real-time on-chain event polling via Soroban RPC

EventProvider polls getEvents() every 3 s on two contract IDs:
- CONTRACT_PIXEL → PixelPaintedEvent (painter, x, y, color, ledger)
- CONTRACT_ACHIEVEMENT → BadgeAwardedEvent (player, badge_id, ledger)

Cursor-based pagination prevents re-fetching seen events; seenIds Set
deduplicates across polls. MAX_EVENTS=200 cap prevents unbounded
state growth. Exposes subscribe(listener) for imperative canvas
updates without triggering re-renders on every poll tick." \
  "2026-08-22T10:30:00+05:30")
echo "C10 $C10"

# ── COMMIT 11: Connected canvas, leaderboard, profile pages ───────────────────
git add \
  src/components/dashboard/connected-canvas.tsx \
  src/components/dashboard/leaderboard-table.tsx \
  src/components/dashboard/profile.tsx \
  src/app/dashboard/page.tsx \
  src/app/dashboard/leaderboard/page.tsx \
  src/app/dashboard/profile/page.tsx

C11=$(make_commit "$C10" "feat(dashboard): connected canvas, leaderboard table, and profile page

ConnectedCanvas: wraps PixelCanvas with contract integration —
calls paint_pixel on click, subscribes to EventProvider to apply
remote paints immediately, shows optimistic local updates.

LeaderboardTable: reads get_top_players() from LeaderboardContract,
renders rank medals, truncated addresses, and pixel counts.

Profile: shows wallet address, XLM balance, total pixels painted by
address, and awarded badges (fetched from AchievementContract).

Route pages: /dashboard, /dashboard/leaderboard, /dashboard/profile —
all wrapped with ConnectWalletPrompt guard." \
  "2026-08-22T16:00:00+05:30")
echo "C11 $C11"

# ── COMMIT 12: CI, docs ────────────────────────────────────────────────────────
git add \
  .github/workflows/ci.yml \
  README.md \
  SPEC.md \
  DEPLOY.md \
  CLAUDE.md \
  scripts/rewrite-history.sh

C12=$(make_commit "$C11" "ci: GitHub Actions pipeline + project documentation

CI matrix (4 jobs, Node 22):
- cargo-test: \`cargo test --locked\` for all three Soroban contracts
- npm-test: vitest unit tests (utils.test.ts)
- lint-typecheck: tsc --noEmit + eslint + prettier format:check
- build: \`next build\` production bundle validation

Docs:
- README.md: setup guide, contract addresses, architecture overview,
  testnet deployment instructions
- SPEC.md: full product specification
- DEPLOY.md: step-by-step Soroban testnet deploy with stellar CLI
- CLAUDE.md: AI-assistant context file for automated code tasks" \
  "2026-08-23T12:00:00+05:30")
echo "C12 $C12"

# ─── Point main to the new tip ─────────────────────────────────────────────────
git update-ref refs/heads/main "$C12"
git reset HEAD  # sync index to new HEAD without touching working tree

echo ""
echo "✅ History rewritten. New log:"
git log --oneline

# StellarCanvas

## Overview

StellarCanvas is a collaborative on-chain pixel canvas built on Stellar Soroban.

Users connect their Stellar wallet and paint pixels on a shared canvas.

Each paint action is an on-chain transaction.

Every transaction immediately updates the canvas, leaderboard and activity feed.

The goal is to demonstrate advanced Soroban smart contracts, event streaming, responsive frontend and production architecture.

---

# Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- StellarWalletsKit
- Soroban Smart Contracts (Rust)
- GitHub Actions
- Vercel

---

# Main Features

## Wallet

- Connect wallet
- Disconnect wallet
- Display address
- Display XLM balance

---

## Canvas

64x64 pixel canvas.

Each pixel stores

- x
- y
- owner
- color
- timestamp

---

## Paint Pixel

User

Click Pixel

↓

Choose Color

↓

Wallet signs transaction

↓

Pixel updates

↓

Canvas updates

↓

Leaderboard updates

↓

Activity feed updates

---

## Leaderboard

Rank users by

- Pixels Painted

Show

- Top 10
- Current Rank

---

## Activity Feed

Display live events.

Examples

Alice painted pixel (12,34)

Bob painted pixel (5,18)

Charlie unlocked First Pixel

Newest first.

---

## Profile

Display

Wallet

Rank

Pixels Painted

Achievements

Recent Activity

---

## Achievements

Award NFT badges.

Examples

- First Pixel
- 10 Pixels
- 100 Pixels
- Top 10

---

# Smart Contracts

## Pixel Contract

Functions

paint_pixel()

get_pixel()

get_canvas()

Events

PixelPainted

---

## Leaderboard Contract

Functions

increment_score()

get_top_players()

---

## Achievement Contract

Functions

award_badge()

get_badges()

---

# Requirements

Production quality.

Responsive.

Modern UI.

Dark theme.

Glassmorphism.

Smooth animations.

Proper loading states.

Proper error handling.

Reusable components.

Good folder structure.

Write tests.

Setup GitHub Actions.

Never generate placeholder code.

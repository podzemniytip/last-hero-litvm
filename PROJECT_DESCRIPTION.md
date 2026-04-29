# Last Hero LitVM Project Description

Last Hero is a full-stack cyberpunk Web3 game for the LitVM LiteForge Testnet.
Players buy fixed-price tickets for `0.01 zkLTC`. Each purchase becomes the new
last hero, adds to the pot, and extends the timer. When the timer expires, anyone
can finalize the round. The last hero receives 90% of the pot, the immutable dev
wallet receives 10%, and the contract automatically starts the next round.

## Live Testnet Contract

- Network: LitVM LiteForge Testnet
- Chain ID: `4441`
- Gas token: `zkLTC`
- Contract: `0x5C8c991E75c44E008b6D5798650187BB87Ef8F45`
- Deploy tx: `0x253820f0875d4c9bb245571c85b20101fba1760a27dc750ccb35e8293c7eb81d`
- Deploy block: `3325516`

## What Is Included

- Solidity contract with reentrancy protection, payout split, round snapshots,
  auto-restart, and event-driven frontend support.
- Foundry deployment script and contract tests.
- Premium React + Vite + TypeScript frontend with RainbowKit, wagmi, ethers v6,
  TanStack Query, Zustand, Framer Motion, particles, confetti, Web Audio effects,
  PWA support, realtime event watching, history table, and responsive cyberpunk UI.
- Environment examples for LitVM RPC, contract address, explorer URL, deploy
  block, and WalletConnect project ID.

## Validation

- `forge test`: 9 passing tests.
- `npm run test`: 13 passing frontend tests.
- `npm run build`: production build passes and generates PWA assets.

## Security Notes

Private keys and local environment files are intentionally excluded from git.
The repository contains only `.env.example` files and public testnet deployment
metadata.

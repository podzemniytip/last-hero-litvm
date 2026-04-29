# Last Hero LitVM dApp

Premium last-ticket-wins blockchain game for LitVM LiteForge Testnet.

- Chain ID: `4441`
- RPC: `https://liteforge.rpc.caldera.xyz/http`
- Explorer: `https://liteforge.explorer.caldera.xyz`
- Native gas token: `zkLTC`
- Ticket price: `0.01 zkLTC`

## Project Layout

```text
contracts/   Foundry Solidity project
frontend/    React + Vite + TypeScript dApp
```

## Current LitVM Deployment

- LastHero: `0x5C8c991E75c44E008b6D5798650187BB87Ef8F45`
- Deploy tx: `0x253820f0875d4c9bb245571c85b20101fba1760a27dc750ccb35e8293c7eb81d`
- Deploy block: `3325516`
- Dev wallet: `0x1b991D18ED1e44aafb087312e90df94D4399F671`

## 1. Clone And Install

```bash
git clone <your-repo-url>
cd last-hero-litvm
cd frontend
npm install
```

Copy the frontend env file:

```bash
cp .env.example .env
```

Set these values after contract deployment:

```env
VITE_CONTRACT_ADDRESS=0x...
VITE_LITVM_RPC_URL=https://liteforge.rpc.caldera.xyz/http
VITE_LITVM_EXPLORER_URL=https://liteforge.explorer.caldera.xyz
VITE_CONTRACT_DEPLOY_BLOCK=0
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 2. Deploy Contract With Foundry

Install Foundry if needed: <https://book.getfoundry.sh/getting-started/installation>

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env`:

```env
PRIVATE_KEY=0x...
RPC_URL=https://liteforge.rpc.caldera.xyz/http
DEV_WALLET=0x...
```

Deploy:

```bash
forge build
forge test
forge script script/DeployLastHero.s.sol:DeployLastHero \
  --rpc-url "$RPC_URL" \
  --broadcast \
  -vvv
```

Copy the deployed `LastHero` address into `frontend/.env` as `VITE_CONTRACT_ADDRESS`.

## 3. Deploy With Remix

1. Open `contracts/src/LastHero.sol` in Remix.
2. Compile with Solidity `0.8.24`.
3. Select injected wallet on LitVM LiteForge.
4. Deploy with constructor argument `devWallet_`.
5. Copy the deployed address into `frontend/.env`.

## 4. Run Locally

```bash
cd frontend
npm run dev
```

Open the printed local Vite URL.

## 5. Build And Deploy Frontend

```bash
cd frontend
npm run test
npm run build
```

Deploy `frontend/dist` to Netlify, Vercel, Cloudflare Pages, or any static host.

### GitHub Pages

This repository includes `.github/workflows/deploy-pages.yml`. After pushing to
`main`, enable GitHub Pages:

1. Open repository settings on GitHub.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Run the `Deploy GitHub Pages` workflow or push to `main`.

The workflow builds `frontend/dist` and deploys it to GitHub Pages. It uses the
current LitVM deployment by default:

```env
VITE_CONTRACT_ADDRESS=0x5C8c991E75c44E008b6D5798650187BB87Ef8F45
VITE_LITVM_RPC_URL=https://liteforge.rpc.caldera.xyz/http
VITE_LITVM_EXPLORER_URL=https://liteforge.explorer.caldera.xyz
VITE_CONTRACT_DEPLOY_BLOCK=3325516
```

For WalletConnect QR support, add a repository variable:

```text
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

The Vite build uses a relative base path by default, so it works both on the
temporary GitHub Pages URL and on a future custom domain.

When you buy a custom domain, add it in GitHub `Settings -> Pages -> Custom
domain`, then configure DNS at your registrar:

```text
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  podzemniytip.github.io
```

For Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: same `VITE_*` values from `frontend/.env`

For Vercel:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: same `VITE_*` values from `frontend/.env`

## Contract Behavior

- A ticket costs exactly `0.01 zkLTC`.
- The first round starts on deployment and runs for 30 minutes.
- Every ticket purchase adds 5 minutes, capped at 1 hour from the purchase time.
- Purchases are blocked after expiry until anyone calls `endRound()`.
- `endRound()` pays 90% of the pot to the last hero, 10% to immutable `devWallet`, records a snapshot, and starts the next round.
- Empty rounds can be ended and restarted without payout.

## Useful Commands

```bash
# Solidity
cd contracts
forge test

# Frontend
cd frontend
npm run test
npm run build
npm run preview
```

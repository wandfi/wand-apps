```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```

## Project Overview

Wandfi Story Protocol - A decentralized finance (DeFi) application for yield vaults built with React, TypeScript, and Vite.

## Key Technologies

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.3.0
- **Routing**: TanStack React Router (v1.154.7)
- **UI Components**: Radix UI + Tailwind CSS 4.1.18
- **Wallet Integration**: RainbowKit 2.2.x + Wagmi 2.19.5 + Viem 2.43.5
- **State Management**: Zustand 4.5.5
- **Data Fetching**: TanStack React Query 5.35.1
- **Charts**: Recharts 2.8.0 + ECharts 6.0.0
- **Utilities**: dayjs, bignumber.js, clsx, tailwind-merge

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (port 6321)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Architecture

### File Structure

```
/
├── app/                      # Application pages and layouts
│   ├── yield-vault/         # Main yield vault page
│   ├── admin/               # Admin dashboard
│   ├── dashboard/           # User dashboard
│   ├── portfolio/           # User portfolio
│   ├── logs/                # Logs page
│   └── providers.tsx        # React context providers (RainbowKit, Wagmi)
├── components/              # Reusable UI components
│   ├── b-vault.tsx          # BVault component (old version)
│   ├── b-vault-new.tsx      # BVault component (new version)
│   ├── bvaults2/            # BVaults v2 components
│   ├── ui/                  # UI library components (shadcn/ui style)
│   └── icons/               # SVG icons
├── config/                  # Configuration files
│   ├── abi/                 # Solidity contract ABIs
│   ├── bvaults.ts           # BVault configurations
│   ├── lpTokens.ts          # LP token configurations
│   └── network.ts           # Network/chain configurations
├── hooks/                   # Custom React hooks
│   ├── useBVaultROI.ts      # Calculate ROI for BVaults
│   ├── useVaultsConfigs.ts  # Get vault configurations
│   └── useElementSizeCheck.ts
├── providers/               # State management and data fetching
│   ├── sliceBVaultsStore.ts # BVault data fetching with React Query
│   ├── sliceUserBVaults.ts  # User BVault positions
│   └── publicClient.ts      # Viem public client for RPC calls
├── routes/                  # TanStack Router route definitions
├── src/                     # Entry point and global styles
│   ├── main.tsx             # App entry point
│   ├── root-provider.tsx    # TanStack Query provider
│   └── constants.ts         # Global constants
├── lib/                     # Utility functions
└── utils/                   # Helper functions
```

### Core Features

1. **BVaults (Bera Vaults)**: DeFi yield vaults with epochs, staking, and rewards
2. **Portfolio Management**: Track user positions across vaults
3. **Admin Dashboard**: Manage vault configurations and epochs
4. **Yield Calculations**: ROI and APY calculations for vault investments
5. **Real-time Data**: Live updates from blockchain via Viem and React Query

### Key Data Types

- **BVaultConfig**: Configuration for each BVault (chain, address, asset type)
- **BVaultDTO**: BVault data from blockchain (epoch count, token totals, etc.)
- **BVaultEpochDTO**: Epoch-specific data (start time, duration, rewards, etc.)

### State Management

- **Zustand**: Used for local state management
- **TanStack React Query**: For server state and data fetching
- **Wagmi/RainbowKit**: For wallet connection and Ethereum interactions

## Important Files

- `/routes/index.tsx`: Root route (renders YieldVaultPage)
- `/app/yield-vault/page.tsx`: Main BVaults interface
- `/components/b-vault-new.tsx`: New BVault component with enhanced UI
- `/providers/sliceBVaultsStore.ts`: Data fetching hooks for BVaults
- `/config/bvaults.ts`: BVault configuration per environment
- `/hooks/useBVaultROI.ts`: ROI calculation hook

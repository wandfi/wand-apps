import { Address, zeroAddress } from 'viem'

export const TOKENS: {
  [k: Address]: {
    symbol: string
    decimal?: number
  }
} = {
  [zeroAddress]: { symbol: 'ETH' },
} as const

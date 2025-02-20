import { Address } from 'viem'

export const LP_TOKENS: { [k: Address]: { poolType: bigint; base: Address; quote: Address; poolId?: Address; baseDecimal?: number; quoteDecimal?: number, isStable?: boolean } } = {
  '0xD69ADb6FB5fD6D06E6ceEc5405D95A37F96E3b96': { poolType: 36000n, base: '0x0e4aaf1351de4c0264c5c7056ef3777b41bd8e03', quote: '0xd6d83af58a19cd14ef3cf6fe848c9a4d21e5727c' },
  '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7': { poolType: 36000n, base: '0x0e4aaf1351de4c0264c5c7056ef3777b41bd8e03', quote: '0x7507c1dc16935b82698e4c63f2746a2fcf994df8' },
  // mainnet
  '0xf961a8f6d8c69e7321e78d254ecafbcc3a637621': {
    isStable: true,
    poolType: 36000n,
    base: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
    quoteDecimal: 6,
    quote: '0x549943e04f40284185054145c6E4e9568C1D3241',
    poolId: '0xf961a8f6d8c69e7321e78d254ecafbcc3a637621000000000000000000000001',
  },
}

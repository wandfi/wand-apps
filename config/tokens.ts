import { Address, isAddressEqual, zeroAddress } from 'viem'
import { hashkeyTestnet, mainnet, sepolia } from 'viem/chains'
import { story } from './network'

export type Token = {
  chain: number[]
  address: Address
  symbol: string
  decimals: number
  isNative?: boolean
}

export const TOKENS: Token[] = [
  { address: zeroAddress, symbol: 'ETH', decimals: 18, chain: [mainnet.id, sepolia.id], isNative: true },
  { address: zeroAddress, symbol: 'IP', decimals: 18, chain: [story.id], isNative: true },
  { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', symbol: 'ETH', decimals: 18, chain: [mainnet.id, sepolia.id], isNative: true },
  { address: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD', symbol: 'vIP', decimals: 18, chain: [story.id] },
  { address: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d4', symbol: 'pvIP', decimals: 18, chain: [story.id] },
  { address: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d7', symbol: 'yvIP', decimals: 18, chain: [story.id] },
  { address: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d5', symbol: 'LPvIP', decimals: 18, chain: [story.id] },
  { address: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d6', symbol: 'bvIP', decimals: 18, chain: [story.id] },
  { address: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aE', symbol: 'WIP', decimals: 18, chain: [story.id] },

  { address: '0xb09a8ba59615a552231cefcee80c3b88706597ed', symbol: 'YTK', decimals: 18, chain: [sepolia.id] },
  { address: '0xf37b6ec18cee80634de01aef83701d6e726e7fc9', symbol: 'BT-INFRA', decimals: 18, chain: [sepolia.id] },

  { address: '0xfa9eeeaf51a053bfb94643ad3d80837c661d99eb', symbol: 'YTK', decimals: 18, chain: [hashkeyTestnet.id] },
  { address: '0x8eeca063d0ec83b98f6af9008c535b1ca2c03e93', symbol: 'BT-INFRA', decimals: 18, chain: [hashkeyTestnet.id] },

  { address: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42', symbol: 'AIDaUSDC', decimals: 6, chain: [story.id] },
  { address: '0xF1815bd50389c46847f0Bda824eC8da914045D14', symbol: 'USDC', decimals: 6, chain: [story.id] },
  { address: '0x66B4CB07229EcCC6f48161DfcC229Ac06af25457', symbol: 'pAIDaUSDC', decimals: 6, chain: [story.id] },
  { address: '0x67B7B0B3fA057703E077D1Df6b50065a1229D41A', symbol: 'pAIDaUSDC', decimals: 6, chain: [story.id] },

  { address: '0x97e733e8583169c3a8f8d18e0556b6567973c5b8', symbol: 'YTK', decimals: 18, chain: [sepolia.id] },
  { address: '0xaca6abef41315da039f0025900bdbb2e85034325', symbol: 'BT-INFRA', decimals: 18, chain: [sepolia.id] },
  // { address: '0xfd031434e2b4d6df10f1608d5adf218d71097a88', symbol: 'BT-VPT-INFRA-1', decimals: 18, chain: [sepolia.id] },
  // { address: '0xfc84818ea8715332c3d49064701c1cdef70efa88', symbol: 'BT-VPT-INFRA-2', decimals: 18, chain: [sepolia.id] },
]

export const TOKENS_MAP: { [k: `${number}_${Address}`]: Token } = TOKENS.reduce((map, item) => {
  return item.chain.reduce((itemmap, chainId) => ({ ...itemmap, [`${chainId}_${item.address.toLowerCase()}`]: item }), map)
}, {})

export function getTokenBy(address?: Address, chainId?: number, defOpt?: Partial<Exclude<Token, 'address' | 'chain'>>) {
  if (!address || !chainId) return undefined
  const token = TOKENS_MAP[`${chainId}_${address.toLowerCase() as Address}`]
  if (!token) {
    const { symbol = 'Token', decimals = 18, isNative } = defOpt ?? {}
    return { address, chain: [chainId], symbol, decimals, isNative } as Token
  }
  return token
}

export function isNativeToken(token: Address) {
  return isAddressEqual(token, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') || token == zeroAddress
}

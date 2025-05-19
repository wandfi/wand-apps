import { Address, zeroAddress } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
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

  { address: '0xa247358b5e3350354bacd8a15becb218d11a9a59', symbol: 'YTK', decimals: 18, chain: [sepolia.id] },
  { address: '0xd4b290cbf95aa997f75f12a0aab4084869a10c4e', symbol: 'BT-INFRA', decimals: 18, chain: [sepolia.id] },
]

export const TOKENS_MAP: { [k: `${number}_${Address}`]: Token } = TOKENS.reduce((map, item) => {
  return item.chain.reduce((itemmap, chainId) => ({ ...itemmap, [`${chainId}_${item.address.toLowerCase()}`]: item }), map)
}, {})

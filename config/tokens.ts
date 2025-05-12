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

  { address: '0x6f01d0fe5329b8f5c8553ac7e75422fdd304c7c5', symbol: 'YTK', decimals: 18, chain: [sepolia.id] },
  { address: '0xedef3c6573db3a48b8f7ddb9fa32f000dc6e89fe', symbol: 'BT-INFRA', decimals: 18, chain: [sepolia.id] },
]

export const TOKENS_MAP: { [k: `${number}_${Address}`]: Token } = TOKENS.reduce((map, item) => {
  return item.chain.reduce((itemmap, chainId) => ({ ...itemmap, [`${chainId}_${item.address.toLowerCase()}`]: item }), map)
}, {})

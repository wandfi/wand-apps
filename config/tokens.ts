import { Address, zeroAddress } from 'viem'
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
]

export const TOKENS_MAP: { [k: `${number}_${Address}`]: Token } = TOKENS.reduce((map, item) => {
  return item.chain.reduce((itemmap, chainId) => ({ ...itemmap, [`${chainId}_${item.address.toLowerCase()}`]: item }), map)
}, {})

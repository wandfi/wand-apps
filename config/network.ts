import { isLNT, isPROD } from '@/constants'
import { providers } from 'ethers'
import _ from 'lodash'
import { Address, Chain, defineChain } from 'viem'
import { LP_TOKENS } from './lpTokens'

export const storyTestnet = defineChain({
  id: 1315,
  name: 'Story Aeneid Testnet',
  iconUrl: '/storynetwork.png',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://aeneid.storyscan.xyz',
    },
  },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 1792 },
  },
  testnet: true,
  fees: {
    baseFeeMultiplier: 1.4,
  },
})

export const story = defineChain({
  id: 1514,
  name: 'Story Mainnet',
  iconUrl: '/storynetwork.png',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },

  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
    // "https://berachain-mainnet.g.alchemy.com/v2/-yCJ0Aq6OmJoAtLknbSiImqfoPCzQCxe"
    public: { http: ['https://evm-rpc.story.mainnet.dteam.tech', 'https://evm-rpc-story.j-node.net', 'https://story-evm-rpc.krews.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://storyscan.xyz/',
    },
  },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 340998 },
  },
  testnet: false,
  fees: {
    baseFeeMultiplier: 1.4,
  },
})

export const apiBatchConfig = { batchSize: 30, wait: 300 }
export const multicallBatchConfig = { batchSize: 100, wait: 300 }

export const storyChains = [storyTestnet, story]
export const lntChains = []
export const SUPPORT_CHAINS: [Chain, ...Chain[]] = _.filter(isLNT ? [...lntChains] : [...storyChains], (item) => (isPROD ? !(item as any).testnet : true)) as any

export const refChainId: { id: number } = { id: isPROD ? story.id : storyTestnet.id }
export const getCurrentChainId = () => {
  return refChainId.id
}

export const setCurrentChainId = (id: number) => {
  if (SUPPORT_CHAINS.find((item) => item.id == id)) refChainId.id = id
}

export const getCurrentChain = () => {
  return SUPPORT_CHAINS.find((item) => item.id == getCurrentChainId())!
}

export function isStorychain() {
  return !!storyChains.find((item) => item.id == getCurrentChainId())
}

export const refEthersProvider: {
  provider?: providers.FallbackProvider | providers.JsonRpcProvider
} = {}

export const BEX_URLS: { [k: number]: string } = {
  [storyTestnet.id]: 'https://www.verio.network/staking',
  [story.id]: 'https://www.verio.network/staking',
}
export const getBexPoolURL = (pool?: Address) => {
  // if (getCurrentChainId() == storyTestnet.id) {
  //   return `${BEX_URLS[getCurrentChainId()]}/pool/${pool}`
  // } else if (story.id) {
  //   return `${BEX_URLS[getCurrentChainId()]}/pools/${LP_TOKENS[pool].poolId}/deposit/`
  // }
  return 'https://www.verio.network/staking'
}

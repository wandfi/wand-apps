import { isLNT, isPROD } from '@/constants'
import { providers } from 'ethers'
import _ from 'lodash'
import { Address, Chain, defineChain } from 'viem'
import { LP_TOKENS } from './lpTokens'

export const berachainTestnet = defineChain({
  id: 80084,
  name: 'Berachain Bartio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: { http: ['https://berachain-bartio.g.alchemy.com/v2/YU6TIvn1RpD1wyHrDMpt4Yt6_bJYmOtk', 'https://bartio.rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Routescan',
      url: 'https://80084.testnet.routescan.io/',
    },
  },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 109269 },
  },
  testnet: true,
  fees: {
    baseFeeMultiplier: 1.4,
  },
})

export const berachain = defineChain({
  id: 80094,
  name: 'Berachain',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: { http: ['https://rpc.berachain.com'] },
    // "https://berachain-mainnet.g.alchemy.com/v2/-yCJ0Aq6OmJoAtLknbSiImqfoPCzQCxe"
    alchemy: { http: ['https://berachain-mainnet.g.alchemy.com/v2/7UXJgo01vxWHLJDk09Y0qZct8Y3zMDbX'] },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://berascan.com/',
    },
  },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 109269 },
  },
  testnet: false,
  fees: {
    baseFeeMultiplier: 1.4,
  },
})

export const sepolia = defineChain({
  id: 11_155_111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://eth-sepolia.public.blastapi.io', 'https://eth-sepolia.g.alchemy.com/v2/WddzdzI2o9S3COdT73d5w6AIogbKq4X-'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
      apiUrl: 'https://api-sepolia.etherscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 751532,
    },
    ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
    ensUniversalResolver: {
      address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
      blockCreated: 5_317_080,
    },
  },
  testnet: true,
})

export const apiBatchConfig = { batchSize: 30, wait: 300 }
export const multicallBatchConfig = { batchSize: 100, wait: 300 }

export const beraChains = [berachainTestnet, berachain]
export const lntChains = [sepolia]
export const SUPPORT_CHAINS: [Chain, ...Chain[]] = _.filter(isLNT ? [...lntChains] : [...beraChains], (item) => (isPROD ? !(item as any).testnet : true)) as any

export const refChainId: { id: number } = { id: isLNT ? sepolia.id : isPROD ? berachain.id : berachainTestnet.id }
export const getCurrentChainId = () => {
  return refChainId.id
}

export const setCurrentChainId = (id: number) => {
  if (SUPPORT_CHAINS.find((item) => item.id == id)) refChainId.id = id
}

export const getCurrentChain = () => {
  return SUPPORT_CHAINS.find((item) => item.id == getCurrentChainId())!
}

export function isBerachain() {
  return !!beraChains.find((item) => item.id == getCurrentChainId())
}

export const refEthersProvider: {
  provider?: providers.FallbackProvider | providers.JsonRpcProvider
} = {}

export const BEX_URLS: { [k: number]: string } = {
  [berachainTestnet.id]: 'https://bartio.bex.berachain.com',
  [berachain.id]: 'https://hub.berachain.com',
}
export const getBexPoolURL = (pool: Address) => {
  if (getCurrentChainId() == berachainTestnet.id) {
    return `${BEX_URLS[getCurrentChainId()]}/pool/${pool}`
  } else if (berachain.id) {
    return `${BEX_URLS[getCurrentChainId()]}/pools/${LP_TOKENS[pool].poolId}/deposit/`
  }
  return ''
}

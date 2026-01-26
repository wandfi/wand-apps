import { type Assign, type Chain, type ChainFormatters, defineChain, type Prettify } from 'viem'
import { monad as _monad, story as _story } from 'viem/chains'
import { ALCHEMY_API_KEY, ANKR_API_KEY } from './env'

function mconfigChain<
  formatters extends ChainFormatters,
  const chain extends Chain<formatters>
>(chain: chain): Prettify<Assign<Chain<undefined>, chain>> {
  const rpcUrls: Chain<formatters>['rpcUrls'] = {
    ...chain.rpcUrls
  }
  if (ALCHEMY_API_KEY) {
    const subdommainmap: { [k: number]: string } = {
      // [_sei.id]: 'sei-mainnet',
      [_story.id]: 'story-mainnet',
      [_monad.id]: 'monad-mainnet'
      // [_arbitrum.id]: 'arb-mainnet',
      // [_base.id]: 'base-mainnet',
      // [_bsc.id]: 'bnb-mainnet',
      // [_berachain.id]: 'berachain-mainnet'
    }
    if (subdommainmap[chain.id]) {
      rpcUrls.alchemy = {
        http: [`https://${subdommainmap[chain.id]}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`]
      }
    }
  }
  if (ANKR_API_KEY) {
    const netmap: { [k: number]: string } = {
      // [_sei.id]: 'sei-evm',
      // [_story.id]: 'story-mainnet',
      // [_arbitrum.id]: 'arbitrum',
      // [_base.id]: 'base',
      // [_bsc.id]: 'bsc',
      [16661]: '0g_mainnet_evm',
    }
    if (netmap[chain.id]) {
      rpcUrls.ankr = {
        http: [`https://rpc.ankr.com/${netmap[chain.id]}/${ANKR_API_KEY}`]
      }
    }
  }
  return defineChain({
    ...chain,
    rpcUrls,
  }) as unknown as Assign<Chain<undefined>, chain>
}

export const story = mconfigChain({
  ..._story,
  iconUrl: '/storynetwork.png',
  defConfirmations: 3,
})

export const monad = mconfigChain({
  ..._monad,
  defConfirmations: 3,
  iconUrl: '/monadnetwork.png',
})

export const apiBatchConfig = { batchSize: 5, wait: 300 }
export const multicallBatchConfig = { batchSize: 5, wait: 300 }

export const SUPPORT_CHAINS: [Chain, ...Chain[]] = [story, monad]

export const getChain = (id: number) => SUPPORT_CHAINS.find((item) => item.id == id)


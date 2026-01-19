import { type Assign, type Chain, type ChainFormatters, defineChain, type Prettify } from 'viem'
import { monad as _monad, story as _story } from 'viem/chains'


const ankrPubMap: { [k: number]: string } = {
  [_story.id]: 'story-mainnet',
  [_monad.id]: 'monad-mainnet',
}
const alchemyMap: { [k: number]: string } = {
  [_story.id]: 'story-mainnet',
  [_monad.id]: 'monad-mainnet',
}
function mconfigChain<
  formatters extends ChainFormatters,
  const chain extends Chain<formatters>
>(chain: chain): Prettify<Assign<Chain<undefined>, chain>> {
  const rpcUrls: Chain<formatters>['rpcUrls'] = {
    ...chain.rpcUrls,
  }
  if (process.env.ALCHEMY_API_KEY && alchemyMap[chain.id]) {
    rpcUrls.alchemy = {
      http: [`https://${alchemyMap[chain.id]}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`]
    }
  }
  if (ankrPubMap[chain.id]) {
    rpcUrls.publicAnkr = {
      http: [`https://rpc.ankr.com/${ankrPubMap[chain.id]}`]
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


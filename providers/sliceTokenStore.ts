import { getNftTokensIdsByUser, getTokenPricesBySymbol } from '@/config/api'
import { LP_TOKENS } from '@/config/lpTokens'
import { getCurrentChain, getCurrentChainId, story, storyTestnet } from '@/config/network'
import { DECIMAL } from '@/constants'
import _ from 'lodash'
import { Address, erc20Abi, zeroAddress } from 'viem'
import { getPC } from './publicClient'
import { SliceFun } from './types'

export type TokenItem = {
  address: Address
  symbol: string
  decimals: number
  name?: string
  url?: string
}
export type TokenStore = {
  totalSupply: { [k: Address]: bigint }
  prices: { [k: Address]: bigint }

  updateTokenTotalSupply: (chainId: number, tokens: Address[]) => Promise<TokenStore['totalSupply']>
  updateTokenPrices: (tokens: Address[]) => Promise<TokenStore['prices']>

  // ---------------------- For current user ------------------------
  balances: { [k: Address]: bigint }
  updateTokensBalance: (chainId: number, tokens: Address[], user: Address) => Promise<TokenStore['balances']>

  // tokenList
  defTokenList: TokenItem[]
  updateDefTokenList: () => Promise<TokenItem[]>

  // nft
  nftBalance: {
    [k: Address]: bigint[]
  }
  updateNftBalance: (tokens: Address[], user: Address) => Promise<TokenStore['nftBalance']>
}

export const sliceTokenStore: SliceFun<TokenStore> = (set, get, init = {}) => {
  const updateTokenTotalSupply = async (chainId: number, tokens: Address[]) => {
    if (tokens.length == 0) return {}
    const pc = getPC(chainId)
    const datas = await Promise.all(
      tokens.map((token) => (token == zeroAddress ? Promise.resolve(0n) : pc.readContract({ abi: erc20Abi, address: token, functionName: 'totalSupply' }))),
    )
    const map = datas.reduce<TokenStore['totalSupply']>((map, item, i) => ({ ...map, [tokens[i]]: item }), {})
    set({ totalSupply: { ...get().totalSupply, ...map } })
    return map
  }
  const updateTokensBalance = async (chainId: number, tokens: Address[], user: Address) => {
    if (tokens.length == 0) return {}
    const pc = getPC(chainId)
    const datas = await Promise.all(
      tokens.map((token) =>
        token == zeroAddress ? pc.getBalance({ address: user }) : pc.readContract({ abi: erc20Abi, address: token, functionName: 'balanceOf', args: [user] }),
      ),
    )
    const map = datas.reduce<TokenStore['balances']>((map, item, i) => ({ ...map, [tokens[i]]: item }), {})
    set({ balances: { ...get().balances, ...map } })
    return map
  }

  const updateTokenPrices = async (tokens: Address[]) => {
    const groups = _.groupBy(tokens, (token) => (LP_TOKENS[token] ? 'lp' : 'token'))
    const mLps = groups['lp'] || []
    // const mTokens = groups['token'] || []
    if (mLps.length !== 0) {
      console.info('mlps;', tokens, mLps)
      // for testnet
      const chain = getCurrentChain()
      if (chain.id === storyTestnet.id) {
        // await updateLPTokensStatForTest(mLps)
      } else if (chain.id === story.id) {
        // const map = await getBeraTokensPrices()
        // set({ prices: { ...get().prices, ...map } })
      }
    }
    const prices = await getTokenPricesBySymbol(['IP'])
    if (prices.length) {
      set({ prices: { ...get().prices, '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD': prices[0].price } })
    }
    // const  getTokenPricesBySymbol()
    return {}
  }

  const updateDefTokenList = async () => {
    const urls: { [k: number]: string } = {
      [story.id]: 'https://hub.berachain.com/internal-env/defaultTokenList.json',
      [storyTestnet.id]: 'https://raw.githubusercontent.com/berachain/default-lists/main/src/tokens/bartio/defaultTokenList.json',
    }
    const tokenUrl = urls[getCurrentChainId()]
    if (!tokenUrl) return []
    const list = await fetch(tokenUrl)
      .then((res) => res.json())
      .then((data) => {
        return (data.tokens as any[])
          .filter((item) => item.chainId === getCurrentChainId())
          .map<TokenItem>((item) => ({
            symbol: item.symbol as string,
            address: item.address as Address,
            decimals: item.decimals as number,
            name: item.name as string,
            url: ((item.logoURI as string) || '').replace('https://https://', 'https://'),
          }))
      })
    localStorage.setItem('catchedDefTokenList_' + getCurrentChainId(), JSON.stringify(list))
    set({ defTokenList: list })
    return list
  }
  const getCatchedDefTokenList = () => {
    try {
      return JSON.parse(localStorage.getItem('catchedDefTokenList_' + getCurrentChainId()) || '[]') as TokenItem[]
    } catch (error) {
      return []
    }
  }

  const updateNftBalance = async (tokens: Address[], user: Address) => {
    const data = await getNftTokensIdsByUser(tokens, user)
    const idsMap = _.mapValues(data, (item) => item.map((id) => BigInt(id)))
    set({ nftBalance: { ...get().nftBalance, ...idsMap } })
    return {}
  }
  return {
    totalSupply: {},
    updateTokenTotalSupply,

    balances: {},
    updateTokensBalance,

    prices: {
      '0x549943e04f40284185054145c6E4e9568C1D3241': DECIMAL,
      '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce': DECIMAL,

      '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42': DECIMAL,
      '0xF1815bd50389c46847f0Bda824eC8da914045D14': DECIMAL,

      '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5': DECIMAL,
      
    },
    updateTokenPrices,

    defTokenList: getCatchedDefTokenList(),
    updateDefTokenList,

    nftBalance: {},
    updateNftBalance,
    ...init,
  }
}

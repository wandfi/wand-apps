import { DECIMAL, ENV } from '@/src/constants'

import { useBvault2sTVL } from '@/components/bvaults2/useFets'
import { BvcsByEnv } from '@/config/bvaults'
import { BVAULTS2CONIG } from '@/config/bvaults2'
import { LP_TOKENS } from '@/config/lpTokens'
import { getTokenBy } from '@/config/tokens'
import { useBVaultsData } from '@/providers/sliceBVaultsStore'
import { useTokenPrices } from '@/providers/sliceTokenStore'
import type { Address } from 'viem'

export type TVLItem = {
  name: string
  symbol: string
  address: Address
  decimals: number
  usdAmount: bigint
  amount: bigint
  price: bigint
}

export function useTVL() {
  // const pvcs = PLAIN_VAULTS_CONFIG[chainId] || []
  const bvaults = useBVaultsData(BvcsByEnv)
  const tprices = useTokenPrices().data
  const tvlV2Items = useBvault2sTVL(BVAULTS2CONIG.filter((item) => item.onEnv.includes(ENV)))
  const tvlV1Items = BvcsByEnv.map<TVLItem>((bvc, i) => {
    const isLP = LP_TOKENS[bvc.asset]
    const bvd = bvaults[i].data
    const lpEnable = isLP && bvd && bvd.lpLiq && bvd.lpBase && bvd.lpQuote && tprices[isLP.base] && tprices[isLP.quote]
    const price = lpEnable ? (tprices[isLP.base] * bvd.lpBase! + tprices[isLP.quote] * bvd.lpQuote!) / bvd.lpLiq! : tprices[bvc.asset] || DECIMAL
    // const amount = lpEnable ? bvd.lpLiq! : 0n
    // const price = tprices[bvc.asset] || DECIMAL
    const amount = bvd?.lpLiq || bvd?.lockedAssetTotal || 0n
    const decimals = getTokenBy(bvc.asset, bvc.chain)!.decimals
    return {
      name: bvc.assetSymbol,
      symbol: bvc.assetSymbol,
      address: bvc.asset,
      decimals,
      price,
      amount,
      usdAmount: (price * amount) / 10n ** BigInt(decimals),
    }
  }).reduce((uniqList: TVLItem[], item) => {
    const uItem = uniqList.find((u) => u.symbol == item.symbol)
    if (uItem) {
      uItem.amount += item.amount
      uItem.usdAmount += item.usdAmount
      return uniqList
    }
    return [...uniqList, item]
  }, [])
  const tvlItems = tvlV2Items.concat(tvlV1Items)
  const tvl = tvlItems.reduce((_sum, item) => _sum + item.usdAmount, 0n)
  return { tvl, tvlItems }
}

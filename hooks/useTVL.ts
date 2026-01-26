import { DECIMAL } from '@/src/constants'

import { useBvault2sTVL } from '@/components/bvaults2/useFets'
import { BvcsByEnv } from '@/config/bvaults'
import { bvcs2ByEnv } from '@/config/bvaults2'
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
  const tvlV2Items = useBvault2sTVL(bvcs2ByEnv)
  const tvlV1Items = BvcsByEnv.map<TVLItem>((bvc, i) => {
    const bvd = bvaults[i].data
    const price = tprices[bvc.assetSymbol]?.bn || DECIMAL
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

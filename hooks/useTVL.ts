import { DECIMAL } from '@/constants'

import { BvcsByEnv } from '@/config/bvaults'
import { LP_TOKENS } from '@/config/lpTokens'
import { getTokenBy } from '@/config/tokens'
import { useStore } from '@/providers/useBoundStore'
import _ from 'lodash'
import { useCurrentChainId } from './useCurrentChainId'


export function useTVL() {
  const chainId = useCurrentChainId()
  const bvcs = BvcsByEnv.filter(item => item.chain === chainId)
  // const pvcs = PLAIN_VAULTS_CONFIG[chainId] || []
  const bvaults = useStore((s) => s.sliceBVaultsStore.bvaults)
  const tprices = useStore((s) => s.sliceTokenStore.prices)

  const tvlItems = _.chain(bvcs)
    .mapValues((bvc) => {
      const isLP = LP_TOKENS[bvc.asset]

      const bvd = bvaults[bvc.vault]
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
    })
    .values()
    .reduce((uniqList: any[], item) => {
      const uItem = uniqList.find((u) => u.symbol == item.symbol)
      if (uItem) {
        uItem.amount += item.amount
        uItem.usdAmount += item.usdAmount
        return uniqList
      }
      return [...uniqList, item]
    }, [])
    .value()

  const tvl = tvlItems.reduce((_sum, item) => _sum + item.usdAmount, 0n)
  return { tvl, tvlItems }
}

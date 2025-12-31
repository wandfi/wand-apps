import { abiBvault2Query, abiHook } from '@/config/abi/BVault2'
import { codeBvualt2Query } from '@/config/abi/codes'
import { BVault2Config } from '@/config/bvaults2'
import { getTokenBy } from '@/config/tokens'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useFet, useFets } from '@/hooks/useFet'
import { aarToNumber, nowUnix } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import _, { toNumber } from 'lodash'
import { useMemo, useRef } from 'react'
import { Address, formatEther, formatUnits, isAddressEqual, parseUnits } from 'viem'
import { useBalance, useTotalSupply } from '../../hooks/useToken'
import { FetKEYS } from './fetKeys'
import { getLpToken, usePtToken, useYtToken } from './getToken'
import { useBvualt2Data } from './useFets'
import { getTokenPriceBySymbol, getTokenPricesBySymbol } from '@/config/api'

export function getLogs(vc: BVault2Config) {
  return getPC(vc.chain)
    .readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'getLog', args: [vc.vault] })
    .catch(() => undefined)
}
export function useLogs(vc: BVault2Config) {
  return useFet({
    key: FetKEYS.Logs(vc),
    fetfn: () => getLogs(vc),
  })
}

export function useLogss(vcs: BVault2Config[]) {
  return useFets(
    ...vcs.map((vc) => ({
      key: FetKEYS.Logs(vc),
      fetfn: () => getLogs(vc),
    })),
  )
}

export function useBT2PTPrice(vc: BVault2Config) {
  const data = useLogs(vc)
  return useMemo(() => ({ ...data, result: calcBt2PtPrice(data.result, 0n, 0n) }), [data.result])
}

export function useBTPriceConvertToken(vc: BVault2Config, token?: Address) {
  return useFet({
    key: FetKEYS.BTPriceConvertToken(vc, token),
    initResult: 0,
    fetfn: async () => {
      if (isAddressEqual(token!, vc.bt)) return 1
      const tc = vc.btConverts.find((item) => isAddressEqual(item.token0, token!))
      if (!tc) return 0
      const one = parseUnits('1', 6)
      const out = await tc.previewConvert(false, one)
      return toNumber(formatUnits(out, 6))
    },
  })
}

export function calcBt2PtPrice(logs: ReturnType<typeof useLogs>['result'], ptChange: bigint, btChange: bigint) {
  if (!logs) return 0
  const rateScalar = aarToNumber(logs.rateScalar, 18)
  const rateAnchor = aarToNumber(logs.rateAnchor, 18)
  const vPt = aarToNumber(logs.vPT + ptChange, 18)
  const BTtp = aarToNumber(logs.BTtp + btChange, 18)
  const Pt = vPt + BTtp > 0 ? vPt / (vPt + BTtp) : 0
  const nPrice = rateScalar > 0 && 1 - Pt != 0 ? (1 / rateScalar) * Math.log(Pt / (1 - Pt)) + rateAnchor : 0
  return nPrice
}

export function calcYt2BtPrice(bt2PtPrice: number) {
  return bt2PtPrice <= 1 ? 0 : (bt2PtPrice - 1) / bt2PtPrice
}

export function useNowUnix(time: number = 100) {
  const ref = useRef(nowUnix())
  if (nowUnix() - ref.current > time) ref.current = nowUnix()
  // console.info('useNowUnix:', ref.current)
  return ref.current
}
export function useEpochRemain(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  const now = useNowUnix()
  const remain = parseInt((epoch && epoch.startTime + epoch.duration > now ? epoch.startTime + epoch.duration - now : 0n).toString())
  // console.info('useEpochRemain:', remain, now)
  return { ...vd, result: remain }
}

const YearSeconds = 365 * 24 * 60 * 60
const apyMax = 1000
export function usePTApy(vc: BVault2Config, ptChange: bigint = 0n, btChange: bigint = 0n) {
  const { result: bt2ptPrice } = useBT2PTPrice(vc)
  const { result: logs } = useLogs(vc)
  const { result: remain } = useEpochRemain(vc)
  // rmain time by year
  const t = remain / YearSeconds
  const apy = Math.min(apyMax, t > 0 && bt2ptPrice > 0 ? _.round(Math.pow(bt2ptPrice, 1 / t) - 1, 5) : 0)
  console.info('ptapy:', bt2ptPrice, t, apy)
  let apyto = apy
  let priceimpact = 0
  // calc change
  if (ptChange != 0n && btChange != 0n && logs) {
    const nPrice = calcBt2PtPrice(logs, ptChange, btChange)
    priceimpact = Math.abs(nPrice - bt2ptPrice) / bt2ptPrice
    apyto = t > 0 ? _.round(Math.pow(nPrice, 1 / t) - 1, 5) : 0
  }
  return [apy, apyto, priceimpact]
}

export function useBTPriceUsd(vc: BVault2Config) {
  return useFet({
    key: FetKEYS.BTPriceUsd(vc),
    initResult: vc.btPriceSymbol ? 0 : 1,
    fetfn: async () => (vc.btPriceSymbol ? getTokenPriceBySymbol(vc.btPriceSymbol) : 1),
  })
}

export function useYTPriceBt(vc: BVault2Config) {
  const data = useBT2PTPrice(vc)
  return { ...data, result: calcYt2BtPrice(data.result) }
}
export function useBTPriceYt(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  const asset = getTokenBy(vc.asset, chainId)!
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return useFet({
    key: FetKEYS.BTPriceYt(epoch?.YT),
    initResult: 0,
    fetfn: async () => {
      const one = parseUnits('1', asset.decimals)
      const [bt1] = await getPC(chainId).readContract({
        abi: abiBvault2Query,
        code: codeBvualt2Query,
        functionName: 'calcBT1ForSwapBTForYT',
        args: [vc.hook, one],
      })
      if (bt1 == 0n) return 0
      const bt2 = await getPC(chainId).readContract({ abi: abiHook, address: vc.hook, functionName: 'getAmountOutVPTToBT', args: [bt1] })
      const price = (one * bt1) / (bt1 - bt2)
      console.info('btPriceYT:', formatEther(bt1), formatEther(bt2), formatEther(price))
      return aarToNumber(price, asset.decimals)
    },
  })
}

export function useUnderlingApy(vc: BVault2Config) {
  return useFet({
    key: FetKEYS.UnderlingApy(vc),
    initResult: vc.underlingApy ?? 0.07,
    fetfn: async () => vc.underlingApy ?? 0.07,
  })
}
export function useYTRoi(vc: BVault2Config, ptChange: bigint = 0n, btChange: bigint = 0n) {
  const { result: logs } = useLogs(vc)
  const { result: btPrice } = useBTPriceUsd(vc)
  const { result: ytPriceBT } = useYTPriceBt(vc)
  const Pyt = btPrice * ytPriceBT
  const { result: underlingApy } = useUnderlingApy(vc)
  const { result: remain } = useEpochRemain(vc)
  const Y = (underlingApy * remain) / YearSeconds
  const roi = Pyt != 0 ? _.round(Y / Pyt - 1, 5) : 0
  let roito = roi
  let priceimpact = 0
  if (ptChange != 0n && btChange != 0n && logs) {
    const nBt2Pt = calcBt2PtPrice(logs, ptChange, btChange)
    if (nBt2Pt != 0) {
      const nYtPriceBT = calcYt2BtPrice(nBt2Pt)
      const nPyt = btPrice * nYtPriceBT
      roito = nPyt != 0 ? _.round(Y / nPyt - 1, 5) : 0
      priceimpact = ytPriceBT > 0 && nYtPriceBT > 0 ? Math.abs(nYtPriceBT - ytPriceBT) / ytPriceBT : 0
    }
  }
  console.info('ytRoi:', ytPriceBT, btPrice, ytPriceBT, Pyt, Y, roi, roito)
  return [roi, roito, priceimpact]
}

// LP的到期收益: underlying APY*剩余时间 * BTtp/365 +（1-pt2btPrice）*PT-YT*yt2btPrice
// LP的成本：BTnet+PT*pt2btPrice+YT*yt2btPrice
// LP APY： LP的到期收益/LP的成本 *（365/剩余时间 ）
export function useLPApy(vc: BVault2Config) {
  // underlying APY * BTtp/(BTnet+PT*pt2btPrice+YT*yt2btPrice)
  const { result: underlyinApy } = useUnderlingApy(vc)
  const { result: logs } = useLogs(vc)
  const chainId = useCurrentChainId()
  const asset = getTokenBy(vc.asset, chainId)!
  const BTnet = aarToNumber(logs?.BTnet ?? 0n, asset.decimals)
  const BTtp = aarToNumber(logs?.BTtp ?? 0n, asset.decimals)
  const pt = usePtToken(vc)
  const yt = useYtToken(vc)
  const ptc = useTotalSupply(pt)
  const ytc = useTotalSupply(yt)
  const PT = ytc.result > ptc.result ? aarToNumber(ytc.result - ptc.result, asset.decimals) : 0
  const YT = ptc.result > ytc.result ? aarToNumber(ptc.result - ytc.result, asset.decimals) : 0
  const { result: bt2ptPrice } = useBT2PTPrice(vc)
  const pt2btPrice = bt2ptPrice > 0 ? 1 / bt2ptPrice : 0
  const yt2btPrice = calcYt2BtPrice(bt2ptPrice)
  const { result: remain } = useEpochRemain(vc)
  const LP的到期收益 = (underlyinApy * remain * BTtp) / YearSeconds + (1 - pt2btPrice) * PT - YT * yt2btPrice
  const LP的成本 = BTnet + PT * pt2btPrice + YT * yt2btPrice
  const apy = LP的成本 > 0 && remain > 0 ? (LP的到期收益 / LP的成本) * (YearSeconds / remain) : 0
  // console.info('LP的到期收益:', BTtp, pt2btPrice, PT, YT, yt2btPrice)
  // console.info('lpApy:', LP的到期收益, LP的成本, apy)
  // const apyBy = BTnet + PT * pt2btPrice + YT * yt2btPrice
  // const apy = apyBy != 0 ? (underlyinApy * BTtp) / apyBy : 0
  return apy
}

export function useLpShare(vc: BVault2Config, lpUserChange: bigint) {
  const lp = getLpToken(vc)
  const lpc = useTotalSupply(lp)
  const lpBalance = useBalance(lp)
  const poolShare = lpc.result > 0 ? _.round(aarToNumber(lpBalance.result, lp.decimals) / aarToNumber(lpc.result, lp.decimals), 5) : 0
  const poolShareTo =
    lpUserChange != 0n
      ? lpc.result + lpUserChange > 0n
        ? _.round(aarToNumber(lpBalance.result + lpUserChange, lp.decimals) / aarToNumber(lpc.result + lpUserChange, lp.decimals), 5)
        : 0
      : poolShare
  return [poolShare, poolShareTo]
}

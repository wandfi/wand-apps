import { abiBvault2Query, abiHook } from '@/config/abi/BVault2'
import { codeBvualt2Query } from '@/config/abi/codes'
import { BVault2Config } from '@/config/bvaults2'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useFet } from '@/hooks/useFet'
import { aarToNumber, getTokenBy, nowUnix } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import _ from 'lodash'
import { formatEther, parseUnits } from 'viem'
import { useBvualt2Data } from './useFets'
import { useTotalSupply } from './useToken'
import { Token } from '@/config/tokens'

export const FetKEYS = {
  Logs: (chainId: number, vc: BVault2Config) => `Logs:${chainId}:${vc.vault}`,
}

export function useLogs(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  return useFet({
    key: FetKEYS.Logs(chainId, vc),
    fetfn: async () => getPC(chainId).readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'getLog', args: [vc.protocal, vc.bt] }),
  })
}
export function useBT2PTPrice(vc: BVault2Config) {
  const data = useLogs(vc)
  return { ...data, result: calcBt2PtPrice(data.result, 0n, 0n) }
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

export function useEpochRemain(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  const remain = parseInt((epoch && epoch.startTime + epoch.duration > nowUnix() ? epoch.startTime + epoch.duration - nowUnix() : 0n).toString())
  return { ...vd, result: remain }
}

const YearSeconds = 365 * 24 * 60 * 60
export function usePTApy(vc: BVault2Config, inputBn: bigint = 0n, outputBn: bigint = 0n, input: 'bt' | 'pt' = 'bt') {
  const { result: bt2ptPrice } = useBT2PTPrice(vc)
  const { result: logs } = useLogs(vc)
  const { result: remain } = useEpochRemain(vc)
  // rmain time by year
  const t = remain / YearSeconds
  const apy = t > 0 && bt2ptPrice > 0 ? _.round(Math.pow(bt2ptPrice, 1 / t) - 1, 5) : 0
  console.info('ptapy:', bt2ptPrice, t, apy)
  let apyto = apy
  let priceimpact = 0
  // calc change
  if (inputBn > 0n && outputBn > 0n && logs) {
    const isInputBT = input == 'bt'
    const nPrice = calcBt2PtPrice(logs, isInputBT ? -outputBn : inputBn, isInputBT ? inputBn : -outputBn)
    priceimpact = Math.abs(nPrice - bt2ptPrice) / bt2ptPrice
    apyto = t > 0 ? _.round(Math.pow(nPrice, 1 / t) - 1, 5) : 0
  }
  return [apy, apyto, priceimpact]
}

export function useBTPriceUsd(vc: BVault2Config) {
  return useFet({
    key: `btPrice:${vc.bt}`,
    initResult: 1,
    fetfn: async () => 1,
  })
}

export function useYTPriceBt(vc: BVault2Config) {
  const data = useBT2PTPrice(vc)
  return { ...data, result: calcYt2BtPrice(data.result) }
}
export function useBTPriceYt(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  const asset = getTokenBy(vc.asset, chainId)
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return useFet({
    key: epoch ? `btPriceYt:${epoch.YT}` : '',
    initResult: 0,
    fetfn: async () => {
      const one = parseUnits('1', asset.decimals)
      const [bt1] = await getPC(chainId).readContract({
        abi: abiBvault2Query,
        code: codeBvualt2Query,
        functionName: 'calcBT1ForSwapBTForYT',
        args: [vc.hook, one, parseUnits('0.05', asset.decimals)],
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
    key: `underlingApy:${vc.asset}`,
    initResult: 1.07,
    fetfn: async () => 1.07,
  })
}
export function useYTRoi(
  vc: BVault2Config,
  inputs?: {
    bt2yt?: { inputBt: bigint; inputBt1: bigint; refoundBt: bigint }
    yt2bt?: { inputYt: bigint; outBt: bigint }
  },
) {
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
  if (inputs && (inputs.bt2yt || inputs.yt2bt)) {
    let nBt2Pt = 0
    if (inputs.bt2yt && inputs.bt2yt.inputBt > 0n && inputs.bt2yt.inputBt1 > 0n && inputs.bt2yt.refoundBt >= 0n) {
      const { inputBt, inputBt1, refoundBt } = inputs.bt2yt
      nBt2Pt = calcBt2PtPrice(logs, inputBt1, -refoundBt)
    } else if (inputs.yt2bt && inputs.yt2bt.inputYt > 0n && inputs.yt2bt.outBt > 0n) {
      const { inputYt, outBt } = inputs.yt2bt
      nBt2Pt = calcBt2PtPrice(logs, -inputYt, inputYt - outBt)
    }
    if (nBt2Pt != 0) {
      const nYtPriceBT = calcYt2BtPrice(nBt2Pt)
      const nPyt = btPrice * nYtPriceBT
      roito = nPyt != 0 ? _.round(Y / nPyt - 1, 5) : 0
      priceimpact = ytPriceBT > 0 && nYtPriceBT > 0 ? Math.abs(nYtPriceBT - ytPriceBT) / ytPriceBT : 0
    }
  }
  console.info('ytRoi:', ytPriceBT, Pyt, Y, roi, roito)
  return [roi, roito, priceimpact]
}

export function useLPApy(vc: BVault2Config) {
  // underlying APY * BTtp/(BTnet+PT*pt2btPrice+YT*yt2btPrice)
  const chainId = useCurrentChainId()
  const { result: underlyinApy } = useUnderlingApy(vc)
  const { result: logs } = useLogs(vc)
  const asset = getTokenBy(vc.asset)
  const BTnet = aarToNumber(logs?.BTnet ?? 0n, asset.decimals)
  const BTtp = aarToNumber(logs?.BTnet ?? 0n, asset.decimals)
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  const pt = epoch ? ({ address: epoch.PT, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token) : undefined
  const yt = epoch ? ({ address: epoch.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token) : undefined
  const ptc = useTotalSupply(pt)
  const ytc = useTotalSupply(yt)
  const PT = ytc.result > ptc.result ? aarToNumber(ytc.result - ptc.result, asset.decimals) : 0
  const YT = ptc.result > ytc.result ? aarToNumber(ptc.result - ytc.result, asset.decimals) : 0
  const { result: bt2ptPrice } = useBT2PTPrice(vc)
  const pt2btPrice = bt2ptPrice > 0 ? 1 / bt2ptPrice : 0
  const yt2btPrice = calcYt2BtPrice(bt2ptPrice)
  const apyBy = BTnet + PT * pt2btPrice + YT * yt2btPrice
  const apy = apyBy != 0 ? (underlyinApy * BTtp) / apyBy : 0
  return apy
}

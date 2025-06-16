import { abiBVault2, abiBvault2Query } from "@/config/abi/BVault2"
import { codeBvualt2Query } from "@/config/abi/codes"
import { BVault2Config } from "@/config/bvaults2"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import { logUserAction } from "@/lib/logs"
import { fmtBn, formatPercent, genDeadline, handleError, parseEthers } from "@/lib/utils"
import { getPC } from "@/providers/publicClient"
import { displayBalance } from "@/utils/display"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useDebounce, useToggle } from "react-use"
import { useAccount, useWalletClient } from "wagmi"
import { ApproveAndTx } from "../approve-and-tx"
import { AssetInput } from "../asset-input"
import { CoinAmount } from "../coin-amount"
import { GetvIP } from "../get-lp"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { SwapDown } from "../ui/bbtn"
import { reFetWithBvault2 } from "./fetKeys"
import { getLpToken, usePtToken, useYtToken } from "./getToken"
import { useLogs, useLPApy, useLpShare } from "./useDatas"
import { useBalance, useTotalSupply } from "../../hooks/useToken"
import { getTokenBy } from "@/config/tokens"


function LPAdd({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)!

    const lp = getLpToken(vc, chainId)
    const lpc = useTotalSupply(lp)
    const pt = usePtToken(vc)!
    const yt = useYtToken(vc)!
    const ptc = useTotalSupply(pt)
    const ytc = useTotalSupply(yt)
    const out = ptc.result >= ytc.result ? pt : yt
    const [keep, toggleKeep] = useToggle(false)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const input = getTokenBy(vc.bt, chainId)!
    const inputBalance = useBalance(input)
    const [calcOutsKey, setCalcOutsKey] = useState<any[]>(['calcLPAddOut'])
    useDebounce(() => setCalcOutsKey(['calcLPAddOut', inputAssetBn]), 300, [inputAssetBn])
    const { data: [ptAmount, ytAmount, lpAmount], isFetching: isFetchingOut } = useQuery({
        queryKey: calcOutsKey,
        initialData: [0n, 0n, 0n],
        queryFn: async () => {
            if (inputAssetBn <= 0n || calcOutsKey.length <= 1) return [0n, 0n, 0n]
            return getPC().readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'calcAddLP', args: [vc.protocal, vc.hook, vc.bt, inputAssetBn] })
        }
    })
    const outAmount = ptc.result >= ytc.result ? ptAmount : ytAmount

    const [poolShare, poolShareTo] = useLpShare(vc, lpAmount)
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={inputBalance.result} setAmount={setInputAsset} />
        <SwapDown />
        {/* <div className="flex justify-between items-center text-xs font-medium w-1/2">
            <span>Keep PT/YT mode</span>
            <Switch2 checked={keep} onChange={toggleKeep} className="translate-x-1/2" />
        </div> */}
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={lp.symbol} disable amount={fmtBn(lpAmount, lp.decimals)} loading={isFetchingOut && inputAssetBn > 0n} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={out.symbol} disable amount={fmtBn(outAmount, out.decimals)} loading={isFetchingOut && inputAssetBn > 0n} />
        <div className="font-medium text-xs opacity-60">Pool Share Change: {formatPercent(poolShare)} → {formatPercent(poolShareTo)}</div>
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Add'
            disabled={inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
            spender={vc.vault}
            approves={{
                [input.address]: inputAssetBn,
            }}
            config={{
                abi: abiBVault2,
                address: vc.vault,
                functionName: 'addLiquidity',
                args: [inputAssetBn, genDeadline()],
            }}
            onTxSuccess={() => {
                logUserAction(vc, address!, `LPAdd:(${fmtBn(inputAssetBn)})`);
                setInputAsset('')
                reFetWithBvault2(chainId, vc, ptc.key, ytc.key, lpc.key, inputBalance.key)
            }}
        />
    </div>
}
function LPRemove({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)!
    const bt = getTokenBy(vc.bt, chainId)!
    const lp = getLpToken(vc, chainId)
    const lpc = useTotalSupply(lp)
    const pt = usePtToken(vc)!
    const yt = useYtToken(vc)!
    const ptc = useTotalSupply(pt)
    const ytc = useTotalSupply(yt)
    const [keep, toggleKeep] = useToggle(false)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const input = lp
    const inputBalance = useBalance(input)
    const out = ptc.result >= ytc.result ? yt : pt
    const [calcOutsKey, setCalcOutsKey] = useState<any[]>(['calcLPRemoveOut'])
    useDebounce(() => setCalcOutsKey(['calcLPRemoveOut', inputAssetBn]), 300, [inputAssetBn])
    const { data: [btAmount, ptAmount, ytAmount], isFetching: isFetchingOut } = useQuery({
        queryKey: calcOutsKey,
        initialData: [0n, 0n, 0n],
        queryFn: async () => {
            if (inputAssetBn <= 0n || calcOutsKey.length <= 1) return [0n, 0n, 0n]
            return getPC().readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'calcRemoveLP', args: [vc.protocal, vc.hook, vc.bt, inputAssetBn] })
        }
    })
    const outAmount = ptc.result >= ytc.result ? ytAmount : ptAmount
    const [poolShare, poolShareTo] = useLpShare(vc, -inputAssetBn)
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={inputBalance.result} setAmount={setInputAsset} />
        <SwapDown />
        {/* <div className="flex justify-between items-center text-xs font-medium w-1/2">
            <span>Keep PT/YT mode</span>
            <Switch2 checked={keep} onChange={toggleKeep} className="translate-x-1/2" />
        </div> */}
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={bt.symbol} disable amount={fmtBn(btAmount, lp.decimals)} loading={isFetchingOut && inputAssetBn > 0n} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={out.symbol} disable amount={fmtBn(outAmount, out.decimals)} loading={isFetchingOut && inputAssetBn > 0n} />
        <div className="font-medium text-xs opacity-60">Pool Share Change: {formatPercent(poolShare)} → {formatPercent(poolShareTo)}</div>
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Remove'
            disabled={inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
            spender={vc.vault}
            approves={{
                [input.address]: inputAssetBn,
            }}
            config={{
                abi: abiBVault2,
                address: vc.vault,
                functionName: 'removeLiquidity',
                args: [inputAssetBn, 0n, genDeadline()],
            }}
            onTxSuccess={() => {
                logUserAction(vc, address!, `LPRemove:(${fmtBn(inputAssetBn)})`);
                setInputAsset('')
                reFetWithBvault2(chainId, vc, ptc.key, ytc.key, lpc.key, inputBalance.key)
            }}
        />
    </div>
}
export function LP({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const bt = getTokenBy(vc.bt, chainId)!
    const lp = getLpToken(vc, chainId)
    const lpc = useTotalSupply(lp)
    const pt = usePtToken(vc)!
    const yt = useYtToken(vc)!
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: lp }).catch(handleError)
    }
    const { result: logs } = useLogs(vc)
    const ptc = useTotalSupply(pt)
    const ytc = useTotalSupply(yt)
    const apy = useLPApy(vc)

    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol={lp.symbol} />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{lp.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>Provides liquidity for PT and YT transactions.</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">{formatPercent(apy)}</div>
                <div className="text-xs font-semibold opacity-60">APY</div>
                <div className="text-xs font-semibold opacity-60 ml-auto">LP amount</div>
                <div className="text-lg font-medium">{displayBalance(lpc.result)}</div>
            </div>
            <div className='flex px-2.5'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>
            <div className="pb-4 px-3 text-xs flex flex-col gap-2">
                <span className="opacity-60">LP Positions</span>
                <div className="flex justify-between items-center gap-5">
                    <CoinAmount token={bt} amount={logs?.BTnet ?? 0n} />
                    <CoinAmount token={pt} amount={ytc.result > ptc.result ? ytc.result - ptc.result : 0n} />
                    <CoinAmount token={yt} amount={ptc.result > ytc.result ? ptc.result - ytc.result : 0n} />
                </div>
            </div>
        </div>
        <div className="card !p-4">
            <SimpleTabs
                listClassName="p-0 gap-6 mb-4"
                triggerClassName={`text-base font-bold leading-none data-[state="active"]:text-black`}
                data={[
                    { tab: 'Add', content: <LPAdd vc={vc} /> },
                    { tab: 'Remove', content: <LPRemove vc={vc} /> },
                ]}
            />
        </div>
    </div>
}
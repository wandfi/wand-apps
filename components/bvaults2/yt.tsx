import { abiBVault2, abiBvault2Query, abiHook } from "@/config/abi/BVault2"
import { codeBvualt2Query } from "@/config/abi/codes"
import { BVault2Config } from "@/config/bvaults2"
import { getTokenBy, Token } from "@/config/tokens"
import { withIfAiraSign } from "@/lib/aria"
import { logUserAction } from "@/lib/logs"
import { fmtBn, formatPercent, genDeadline, handleError, parseEthers } from "@/lib/utils"
import { getPC } from "@/providers/publicClient"
import { displayBalance } from "@/utils/display"
import { useQuery } from "@tanstack/react-query"
import _ from "lodash"
import { useState } from "react"
import { useDebounce, useToggle } from "react-use"
import { formatEther, parseUnits } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { useBalance, useTotalSupply } from "../../hooks/useToken"
import { Txs, withTokenApprove } from "../approve-and-tx"
import { Fees } from "../fees"
import { GetByStoryHunt } from "../get-lp"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { TokenInput } from "../token-input"
import { Swap } from "../ui/bbtn"
import { Tip } from "../ui/tip"
import { convertBt, previewConvertBt, useWrapBtTokens } from "./bt"
import { reFetWithBvault2 } from "./fetKeys"
import { useYtToken } from "./getToken"
import { PTYTMint, PTYTRedeem } from "./pt"
import { useBTPriceConvertToken, useLogs, usePTApy, useYTPriceBt, useYTRoi } from "./useDatas"
import { Bvault2Feerate } from "./feerate"


function YTSwap({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const asset = getTokenBy(vc.asset, vc.chain)!
    const yt = useYtToken(vc)!
    const bt = getTokenBy(vc.bt, vc.chain)!
    const ytBalance = useBalance(yt)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const tokens = useWrapBtTokens(vc)
    const [ct, setCT] = useState(tokens[0])
    const inputs = isToggled ? [yt] : tokens
    const outputs = isToggled ? tokens : [yt]
    const input = isToggled ? yt : ct
    const output = isToggled ? ct : yt
    const inputBalance = useBalance(input)
    const { result: ytPriceBt } = useYTPriceBt(vc)
    const { result: btPriceCT } = useBTPriceConvertToken(vc, ct.address)
    const ytPriceCT = ytPriceBt * btPriceCT
    const price = _.round(isToggled ? ytPriceCT : ytPriceCT > 0 ? 1 / ytPriceCT : 0, 2)
    const swapPrice = `1 ${input.symbol} = ${price} ${output.symbol}`
    const onSwitch = () => {
        toggle()
    }
    const [calcYtSwapKey, setCalcYtSwapKey] = useState<any[]>(['calcYTSwapOut'])
    useDebounce(() => setCalcYtSwapKey(['calcYTSwapOut', isToggled, inputAssetBn, input, output]), 300, [isToggled, inputAssetBn, input, output])
    const { data: [outAmount, bt1Amount, refoundBt], isFetching: isFetchingOut } = useQuery({
        queryKey: calcYtSwapKey,
        retry: 0,
        initialData: [0n, 0n, 0n],
        queryFn: async () => {
            if (inputAssetBn <= 0n) return [0n, 0n, 0n]
            const pc = getPC(vc.chain);
            if (isToggled) {
                let outAmount = await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactYTforBT', args: [inputAssetBn] })
                outAmount = await previewConvertBt(vc, false, output.address, outAmount);
                return [outAmount, 0n, 0n]

            } else {
                let inputBtAmount = await previewConvertBt(vc, true, input.address, inputAssetBn)

                const [bestBT1, count] = await pc.readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'calcBT1ForSwapBTForYT', args: [vc.hook, inputBtAmount] })
                    .catch(() => [0n, 0n] as [bigint, bigint])
                console.info('calcBT1:', formatEther(bestBT1), count, formatEther(inputBtAmount))
                if (bestBT1 == 0n) return [0n, 0n, 0n]
                const [amountBtUsed, refoundBt] = await Promise.all([
                    pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteBTforExactYT', args: [inputBtAmount, bestBT1] }),
                    pc.readContract({ abi: abiHook, address: vc.hook, functionName: 'getAmountOutVPTToBT', args: [bestBT1] })
                ])
                return [bestBT1, bestBT1, refoundBt]
            }
        }
    })
    const errorInput = !isFetchingOut && calcYtSwapKey.includes(inputAssetBn) && inputAssetBn > 0 && outAmount == 0n ? 'Market liquidity is insufficient' : ''
    const [roi, roito, priceimpact] = useYTRoi(vc, isToggled ? -inputAssetBn : bt1Amount, isToggled ? inputAssetBn - outAmount : -refoundBt)
    const [apy, apyTo] = usePTApy(vc, isToggled ? -inputAssetBn : bt1Amount, isToggled ? inputAssetBn - outAmount : -refoundBt)
    const getTxs: Parameters<typeof Txs>['0']['txs'] = async (arg) => {
        if (isToggled) {
            const txsApproves = await withTokenApprove({
                approves: [{ spender: vc.vault, token: input.address, amount: inputAssetBn }],
                pc: getPC(vc.chain),
                user: address!,
                tx: {
                    name: `Swap ${yt.symbol} for ${bt.symbol}`,
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swapExactYTforBT',
                    args: [inputAssetBn, 0n, genDeadline()],
                }
            })
            let btAmount = await arg.pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactYTforBT', args: [inputAssetBn] })
            const unwrapTxs = await convertBt(vc, false, output.address, btAmount, arg.wc.account.address)
            return [...txsApproves, ...unwrapTxs.txs]

        } else {
            await withIfAiraSign({ ...arg, token: input, user: address! })
            const { txs, out: sharesBn } = await convertBt(vc, true, input.address, inputAssetBn, arg.wc.account.address)
            const txsApproves = await withTokenApprove({
                approves: [{ spender: vc.vault, token: vc.bt, amount: sharesBn }],
                pc: getPC(vc.chain),
                user: address!,
                tx: {
                    name: `Swap ${bt.symbol} for ${yt.symbol}`,
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swapBTforExactYT',
                    args: [sharesBn, bt1Amount, genDeadline()],
                }
            })
            return [...txs, ...txsApproves]
        }

    }
    const inputSetCT = (t: Token) => !isToggled && setCT(t)
    const outputSetCT = (t: Token) => isToggled && setCT(t)

    return <div className='flex flex-col gap-1'>
        <TokenInput tokens={inputs} onTokenChange={inputSetCT} amount={inputAsset} setAmount={setInputAsset} error={errorInput} />
        <Swap onClick={onSwitch} />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetByStoryHunt t={asset} />
        </div>
        <TokenInput tokens={outputs} onTokenChange={outputSetCT} checkBalance={false} balance={false} disable amount={fmtBn(outAmount, output.decimals)} loading={isFetchingOut} />
        <div className="flex justify-between items-center text-xs font-medium">
            <div>Price: {swapPrice}</div>
            <div>Price Impact: {formatPercent(priceimpact)}</div>
        </div>
        <div className="flex justify-between items-center text-xs font-medium opacity-60">
            <div>
                Est. ROI Change:   {formatPercent(roi)} → {formatPercent(roito)}<br />
                Implied APY Change: {formatPercent(apy)} → {formatPercent(apyTo)}
            </div>
            <Bvault2Feerate vc={vc} />
        </div>
        <Txs
            className='mx-auto mt-4'
            tx='Swap'
            disabled={isFetchingOut || inputAssetBn <= 0n || inputAssetBn > inputBalance.result || (!isToggled && bt1Amount == 0n)}
            txs={getTxs}
            onTxSuccess={() => {
                logUserAction(vc, address!, isToggled ? `YTSwap:YT->BT:(${fmtBn(inputAssetBn)})` : `YTSwap:BT->YT:(${fmtBn(inputAssetBn)}, bt1:${fmtBn(bt1Amount)})`)
                setInputAsset('')
                reFetWithBvault2(vc, ytBalance.key, inputBalance.key)
            }}
        />
    </div>
}
export function YT({ vc }: { vc: BVault2Config }) {
    const asset = getTokenBy(vc.asset, vc.chain)!
    const yt = useYtToken(vc)!
    const ytTotalSupply = useTotalSupply(yt)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: yt }).catch(handleError)
    }
    const [roi] = useYTRoi(vc)
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol={yt.symbol} />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{yt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>1 {yt.symbol} gets the yield of 1 {asset.symbol} until maturity</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">{formatPercent(roi)}</div>
                <div className="text-xs font-semibold opacity-60">Est.ROI <Tip>If underlying APY remains unchanged from now on</Tip></div>
                <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                <div className="text-lg font-medium">{displayBalance(ytTotalSupply.result, undefined, yt.decimals)}</div>
            </div>
            <div className='flex px-2 pb-4'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>
        </div>
        <div className="card !p-4">
            <SimpleTabs
                listClassName="p-0 gap-6 mb-4"
                triggerClassName={`text-base font-bold leading-none data-[state="active"]:text-black`}
                data={[
                    { tab: 'Swap', content: <YTSwap vc={vc} /> },
                    { tab: 'Mint', content: <PTYTMint vc={vc} /> },
                    { tab: 'Redeem', content: <PTYTRedeem vc={vc} /> },
                ]}
            />
        </div>
    </div>
}

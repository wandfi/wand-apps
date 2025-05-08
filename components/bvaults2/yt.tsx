import { abiBVault2, abiBvault2Query } from "@/config/abi/BVault2"
import { BVault2Config } from "@/config/bvaults2"
import { Token } from "@/config/tokens"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import { fmtBn, genDeadline, getTokenBy, handleError, parseEthers } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useDebounce, useToggle } from "react-use"
import { useAccount, useWalletClient } from "wagmi"
import { ApproveAndTx } from "../approve-and-tx"
import { AssetInput } from "../asset-input"
import { Fees } from "../fees"
import { GetvIP } from "../get-lp"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { Swap } from "../ui/bbtn"
import { Tip } from "../ui/tip"
import { PTYTMint, PTYTRedeem } from "./pt"
import { useBvualt2Data } from "./useFets"
import { useBalance, useTotalSupply } from "./useToken"
import { displayBalance } from "@/utils/display"
import { getPC } from "@/providers/publicClient"
import { isAddressEqual, zeroAddress } from "viem"
import { codeBvualt2Query } from "@/config/abi/codes"
import { logUserAction } from "@/lib/logs"
import { reFet } from "@/hooks/useFet"


function YTSwap({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const bt = getTokenBy(vc.bt, chainId)
    const vd = useBvualt2Data(vc)
    const epoch = vd.result!.current!
    const yt = { address: epoch.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
    const ytBalance = useBalance(yt)
    const btBalance = useBalance(bt)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const inputBalance = isToggled ? ytBalance : btBalance
    const input = isToggled ? yt : bt
    const output = isToggled ? bt : yt
    const swapPrice = `1 ${input.symbol} = ${'23.3'} ${output.symbol}`
    const priceImpact = `20%`
    const onSwitch = () => {
        toggle()
    }
    const [calcYtSwapKey, setCalcYtSwapKey] = useState<any[]>(['calcPTSwapOut'])
    useDebounce(() => setCalcYtSwapKey(['calcPTSwapOut', isToggled, inputAssetBn]), 300, [isToggled, inputAssetBn])
    const { data: [outAmount, bt1Amount], isFetching: isFetchingOut } = useQuery({
        queryKey: calcYtSwapKey,
        enabled: inputAssetBn > 0n && calcYtSwapKey.length > 1 && vd.result && !isAddressEqual(vd.result.hook, zeroAddress),
        initialData: [0n, 0n],
        queryFn: async () => {
            if (isToggled) {
                const outAmount = await getPC().readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'quoteExactYTforBT', args: [vd.result!.hook, inputAssetBn] })
                return [outAmount, 0n]
            } else {
                const bestBT1 = await getPC().readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'calcBT1ForSwapBTForYT', args: [vd.result!.hook, inputAssetBn] })
                const [outAmount] = await getPC().readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'quoteExactBTforYT', args: [vd.result!.hook, inputAssetBn, bestBT1] })
                return [outAmount, bestBT1]
            }
        }
    })

    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={inputBalance.result} setAmount={setInputAsset} />
        <Swap onClick={onSwitch} />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={vc.asset} />
        </div>
        <AssetInput asset={output.symbol} disable amount={fmtBn(outAmount, output.decimals)} />
        <div className="flex justify-between items-center text-xs font-medium">
            <div>Price: {swapPrice}</div>
            <div>Price Impact: {priceImpact}</div>
        </div>
        <div className="flex justify-between items-center text-xs font-medium opacity-60">
            <div>
                Est. ROI Change:   233% → 235%<br />
                Implied APY Change: 233% → 235%
            </div>
            <Fees fees={[{ name: 'Transaction Fees', value: 1.2 }, { name: 'Unstake Fees(Verio)', value: 1.2 }]} />
        </div>
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Swap'
            disabled={isFetchingOut || inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
            spender={vc.vault}
            approves={{
                [input.address]: inputAssetBn,
            }}
            config={{
                abi: abiBVault2,
                address: vc.vault,
                functionName: isToggled ? 'swapExactYTForBT' : 'swapExactBTForYT',
                args: isToggled ? [inputAssetBn, 0n, genDeadline()] : [inputAssetBn, bt1Amount, 0n, genDeadline()],
            }}
            onTxSuccess={() => {
                logUserAction(vc, address!, isToggled? `YTSwap:YT->BT:(${fmtBn(inputAssetBn)})`: `YTSwap:BT->YT:(${fmtBn(inputAssetBn)}, bt1:${fmtBn(bt1Amount)})`)
                setInputAsset('')
                reFet(...vd.key, btBalance.key, ytBalance.key)
            }}
        />
    </div>
}
export function YT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const vd = useBvualt2Data(vc)
    const epoch = vd.result!.current!
    const yt = { address: epoch.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
    const ytTotalSupply = useTotalSupply(yt)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: yt }).catch(handleError)
    }
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol='YToken' />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{yt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>1 {yt.symbol} gets the yield of 1 {asset.symbol} until maturity</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">150%</div>
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

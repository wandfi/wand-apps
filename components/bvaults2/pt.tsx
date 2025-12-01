import { abiBVault2 } from "@/config/abi/BVault2"
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
import { useAccount, useWalletClient } from "wagmi"
import { useBalance, useTotalSupply } from "../../hooks/useToken"
import { Txs, withTokenApprove } from "../approve-and-tx"
import { AssetInput } from "../asset-input"
import { GetByThird } from "../get-lp"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { TokenInput } from "../token-input"
import { Swap, SwapDown } from "../ui/bbtn"
import { convertBt, previewConvertBt, useWrapBtTokens } from "./bt"
import { Bvault2Feerate } from "./feerate"
import { reFetWithBvault2 } from "./fetKeys"
import { usePtToken, useYtToken } from "./getToken"
import { useBT2PTPrice, useBTPriceConvertToken, usePTApy } from "./useDatas"

function PTSwap({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const asset = getTokenBy(vc.asset, vc.chain)!
    const bt = getTokenBy(vc.bt, vc.chain)!
    const pt = usePtToken(vc)!
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const tokens = useWrapBtTokens(vc, true, !isToggled)
    const [ct, setCT] = useState(tokens[0])
    const inputs = isToggled ? [pt] : tokens
    const outputs = isToggled ? tokens : [pt]
    const input = isToggled ? pt : ct
    const output = isToggled ? ct : pt
    const inputBalance = useBalance(input)
    const outputBalance = useBalance(output)
    const { result: btPricePT } = useBT2PTPrice(vc)
    const { result: btPriceCT } = useBTPriceConvertToken(vc, ct.address)
    const ctPricePT = btPriceCT !== 0 ? btPricePT / btPriceCT : 0;
    const price = isToggled ? (ctPricePT !== 0 ? _.round(1 / ctPricePT, 2) : 0) : _.round(ctPricePT, 2)
    const swapPrice = `1 ${input.symbol} = ${price} ${output.symbol}`
    const [calcPtSwapKey, setCalcPtSwapKey] = useState<any[]>(['calcPTSwapOut'])
    useDebounce(() => setCalcPtSwapKey(['calcPTSwapOut', isToggled, inputAssetBn, input, output]), 300, [isToggled, inputAssetBn, input, output])
    const { data: outAmount, isFetching: isFetchingOut } = useQuery({
        queryKey: calcPtSwapKey,
        initialData: 0n,
        queryFn: async (params) => {
            if (inputAssetBn <= 0n || params.queryKey.length == 1) return 0n
            const pc = getPC(vc.chain)
            if (isToggled) {
                const btAmount = await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactPTforBT', args: [inputAssetBn] })
                return previewConvertBt(vc, false, output.address, btAmount)
            } else {
                const btAmount = await previewConvertBt(vc, true, input.address, inputAssetBn)
                return pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactBTforPT', args: [btAmount] })
            }
        }
    })
    // const isFetchingOut = false
    // const outAmount = 0n;
    const errorInput = !isFetchingOut && inputAssetBn > 0 && outAmount == 0n ? 'Market liquidity is insufficient' : ''
    // isInputBT ? -outputBn : inputBn, isInputBT ? inputBn : -outputBn
    const [apy, apyto, priceimpcat] = usePTApy(vc, isToggled ? inputAssetBn : -outAmount, isToggled ? -outAmount : inputAssetBn)
    const onSwitch = () => {
        toggle()
    }
    const getTxs: Parameters<typeof Txs>['0']['txs'] = async (arg) => {
        if (isToggled) {
            const txsApproves = await withTokenApprove({
                approves: [{ spender: vc.vault, token: input.address, amount: inputAssetBn }],
                pc: getPC(vc.chain),
                user: arg.wc.account.address,
                tx: {
                    name: `Swap ${pt.symbol} for ${bt.symbol}`,
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swapExactPTforBT',
                    args: [inputAssetBn, 0n, genDeadline()],
                }
            })
            const btAmount = await arg.pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactPTforBT', args: [inputAssetBn] })
            const unwrapBTtxs = await convertBt(vc, false, output.address, btAmount, arg.wc.account.address)
            return [...txsApproves, ...unwrapBTtxs.txs]
        } else {
            await withIfAiraSign({ ...arg, token: input, user: arg.wc.account.address })
            const wrapBt = await convertBt(vc, true, input.address, inputAssetBn, arg.wc.account.address)
            const txsApprove = await withTokenApprove({
                approves: [{ spender: vc.vault, token: vc.bt, amount: wrapBt.out }],
                pc: getPC(vc.chain),
                user: arg.wc.account.address,
                tx: {
                    name: `Swap ${bt.symbol} for ${pt.symbol}`,
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swapExactBTforPT',
                    args: [wrapBt.out, 0n, genDeadline()],
                }
            })
            return [...wrapBt.txs, ...txsApprove]
        }

    }
    const inputSetCT = (t: Token) => !isToggled && setCT(t)
    const outputSetCT = (t: Token) => isToggled && setCT(t)
    return <div className='flex flex-col gap-1'>
        <TokenInput tokens={inputs} onTokenChange={inputSetCT} amount={inputAsset} setAmount={setInputAsset} error={errorInput} />
        <Swap onClick={onSwitch} />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetByThird t={asset} />
        </div>
        <TokenInput tokens={outputs} checkBalance={false} balance={false} onTokenChange={outputSetCT} disable amount={fmtBn(outAmount, output.decimals)} loading={isFetchingOut && inputAssetBn > 0n} />
        <div className="flex justify-between items-center text-xs font-medium">
            <div>Price: {swapPrice}</div>
            <div>Price Impact: {formatPercent(priceimpcat)}</div>
        </div>
        <div className="flex justify-between items-center text-xs font-medium opacity-60">
            <div>Implied APY Change: {formatPercent(apy)} → {formatPercent(apyto)}</div>
            <Bvault2Feerate vc={vc} />
        </div>
        <Txs
            className='mx-auto mt-4'
            tx='Swap'
            disabled={inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
            txs={getTxs}
            onTxSuccess={() => {
                logUserAction(vc, address!, `PTSwap:${isToggled ? 'PT->BT' : 'BT->PT'}:(${fmtBn(inputAssetBn)})`)
                setInputAsset('')
                reFetWithBvault2(vc, inputBalance.key, outputBalance.key)
            }}
        />
    </div>
}
export function PTYTMint({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const asset = getTokenBy(vc.asset, vc.chain)!
    const pt = usePtToken(vc)!
    const yt = useYtToken(vc)!
    const bt = getTokenBy(vc.bt, vc.chain)!
    const tokens = useWrapBtTokens(vc)
    const [ct, setCT] = useState(tokens[0])
    const input = ct
    const inputBalance = useBalance(input)
    const ptBalance = useBalance(pt)
    const ytBalance = useBalance(yt)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset, input.decimals)
    const [calcKey, setCalcKey] = useState<any[]>(['calcPTYTMintOut'])
    useDebounce(() => setCalcKey(['calcPTYTMintOut', inputAssetBn, input]), 300, [inputAssetBn, input])
    const { data: outAmount, isFetching: isFetchingOut } = useQuery({
        queryKey: calcKey,
        initialData: 0n,
        queryFn: async (params) => {
            if (inputAssetBn <= 0n || params.queryKey.length == 1) return 0n
            return previewConvertBt(vc, true, input.address, inputAssetBn)
        }
    })
    const txs: Parameters<typeof Txs>['0']['txs'] = async (arg) => {
        if (!address) return []
        await withIfAiraSign({ ...arg, token: input, user: address })
        const wrapBT = await convertBt(vc, true, input.address, inputAssetBn, arg.wc.account.address)
        const txsApprove = await withTokenApprove({
            approves: [{ spender: vc.vault, token: vc.bt, amount: wrapBT.out, }],
            pc: getPC(vc.chain), user: address,
            tx: { name: `Mint ${pt.symbol} and ${yt.symbol}`, abi: abiBVault2, address: vc.vault, functionName: 'mintPTandYT', args: [wrapBT.out] }
        })
        return [...wrapBT.txs, ...txsApprove]
    }
    return <div className='flex flex-col gap-1'>
        <TokenInput tokens={tokens} onTokenChange={setCT} amount={inputAsset} setAmount={setInputAsset} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetByThird t={asset} />
        </div>
        <AssetInput asset={pt.symbol} disable amount={fmtBn(outAmount, bt.decimals)} loading={isFetchingOut} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={yt.symbol} disable amount={fmtBn(outAmount, bt.decimals)} loading={isFetchingOut} />
        <Txs
            className='mx-auto mt-4'
            tx='Mint'
            disabled={inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
            txs={txs}
            onTxSuccess={() => {
                logUserAction(vc, address!, `PTYTMint:(${fmtBn(inputAssetBn)})`)
                setInputAsset('')
                reFetWithBvault2(vc, inputBalance.key, ptBalance.key, ytBalance.key)
            }}
        />
    </div>
}
export function PTYTRedeem({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const asset = getTokenBy(vc.asset, vc.chain)!
    const tokens = useWrapBtTokens(vc, true, false)
    const [ct, setCT] = useState(tokens[0])
    const out = ct
    const pt = usePtToken(vc)!
    const yt = useYtToken(vc)!
    const ptBalance = useBalance(pt)
    const ytBalance = useBalance(yt)
    const outBalance = useBalance(out)
    const [input, setInput] = useState('')
    const inputBn = parseEthers(input, pt.decimals)
    const [calcKey, setCalcKey] = useState<any[]>(['calcPTYTRedeemOut'])
    useDebounce(() => setCalcKey(['calcPTYTRedeemOut', inputBn, out]), 300, [inputBn, out])
    const { data: outAmount, isFetching: isFetchingOut } = useQuery({
        queryKey: calcKey,
        initialData: 0n,
        queryFn: async () => {
            if (inputBn <= 0n || calcKey.length == 1) return 0n
            return previewConvertBt(vc, false, out.address, inputBn)
        }
    })
    const getTxs: Parameters<typeof Txs>['0']['txs'] = async (arg) => {
        const redeemTxs = [{
            name: `Redeem ${pt.symbol} and ${yt.symbol}`,
            abi: abiBVault2,
            address: vc.vault,
            functionName: 'redeemByPTandYT',
            args: [inputBn]
        }]
        const unwrapBTtxs = await convertBt(vc, false, out.address, inputBn, arg.wc.account.address)
        return [...redeemTxs, ...unwrapBTtxs.txs]
    }
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={pt.symbol} amount={input} balance={ptBalance.result} setAmount={setInput} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={yt.symbol} amount={input} balance={ytBalance.result} setAmount={setInput} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetByThird t={asset} />
        </div>
        <TokenInput tokens={tokens} onTokenChange={setCT} disable amount={fmtBn(outAmount, out.decimals)} loading={isFetchingOut && inputBn > 0n} />
        <Txs
            className='mx-auto mt-4'
            tx='Redeem'
            disabled={inputBn <= 0n || inputBn > ptBalance.result || inputBn > ytBalance.result}
            txs={getTxs}
            onTxSuccess={() => {
                logUserAction(vc, address!, `PTYTRedeem:(${fmtBn(inputBn)})`)
                setInput('')
                reFetWithBvault2(vc, ptBalance.key, ytBalance.key, outBalance.key)
            }}
        />
    </div>
}

export function PT({ vc }: { vc: BVault2Config }) {
    const asset = getTokenBy(vc.asset, vc.chain)!
    const pt = usePtToken(vc)!
    const ptc = useTotalSupply(pt)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: pt }).catch(handleError)
    }
    console.info('PT:')
    const [apy] = usePTApy(vc)
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-green-500/50 gap-5'>
                <CoinIcon size={48} symbol={pt.symbol} />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{pt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>1 {pt.symbol} is equal to1 {asset.symbol} at maturity</div>
                </div>
            </div>
            <div className='flex justify-between px-2.5 pt-2 gap-2.5 flex-wrap'>
                <div className="flex whitespace-nowrap items-baseline justify-between gap-2.5">
                    <div className="text-lg font-medium">{formatPercent(apy)}</div>
                    <div className="text-xs font-semibold opacity-60">Fixed APY</div>
                </div>
                <div className="flex whitespace-nowrap items-baseline justify-between gap-2.5">
                    <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                    <div className="text-lg font-medium">{displayBalance(ptc.result, undefined, pt.decimals)}</div>
                </div>
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
                    { tab: 'Swap', content: <PTSwap vc={vc} /> },
                    { tab: 'Mint', content: <PTYTMint vc={vc} /> },
                    { tab: 'Redeem', content: <PTYTRedeem vc={vc} /> },
                ]}
            />
        </div>
    </div>
}
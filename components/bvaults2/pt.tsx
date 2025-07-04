import { abiBT, abiBVault2 } from "@/config/abi/BVault2"
import { BVault2Config } from "@/config/bvaults2"
import { getTokenBy, Token } from "@/config/tokens"
import { logUserAction } from "@/lib/logs"
import { fmtBn, formatPercent, genDeadline, handleError, parseEthers } from "@/lib/utils"
import { getPC } from "@/providers/publicClient"
import { displayBalance } from "@/utils/display"
import { useQuery } from "@tanstack/react-query"
import _ from "lodash"
import { useState } from "react"
import { useDebounce, useToggle } from "react-use"
import { isAddressEqual } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { useBalance, useTotalSupply } from "../../hooks/useToken"
import { TX, Txs, withTokenApprove } from "../approve-and-tx"
import { AssetInput } from "../asset-input"
import { Fees } from "../fees"
import { GetvIP } from "../get-lp"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { TokenInput } from "../token-input"
import { Swap, SwapDown } from "../ui/bbtn"
import { unwrapBT, useWrapBtTokens, wrapToBT } from "./bt"
import { reFetWithBvault2 } from "./fetKeys"
import { usePtToken, useYtToken } from "./getToken"
import { useBT2PTPrice, usePTApy } from "./useDatas"

function PTSwap({ vc }: { vc: BVault2Config }) {
    const { address } = useAccount()
    const bt = getTokenBy(vc.bt, vc.chain)!
    const pt = usePtToken(vc)!
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const tokens = useWrapBtTokens(vc)
    const [ct, setCT] = useState(tokens[0])
    const inputs = isToggled ? [pt] : tokens
    const outputs = isToggled ? tokens : [pt]
    const input = isToggled ? pt : ct
    const output = isToggled ? ct : pt
    const inputBalance = useBalance(input)
    const outputBalance = useBalance(output)
    const { result: btPrice } = useBT2PTPrice(vc)
    const price = isToggled ? _.round(1 / btPrice, 2) : _.round(btPrice, 2)
    const swapPrice = `1 ${input.symbol} = ${price} ${output.symbol}`
    const [calcPtSwapKey, setCalcPtSwapKey] = useState<any[]>(['calcPTSwapOut'])
    useDebounce(() => setCalcPtSwapKey(['calcPTSwapOut', isToggled, inputAssetBn, input, output]), 300, [isToggled, inputAssetBn, input, output])
    const { data: outAmount, isFetching: isFetchingOut } = useQuery({
        queryKey: calcPtSwapKey,
        initialData: 0n,
        queryFn: async () => {
            if (inputAssetBn <= 0n || calcPtSwapKey.length == 1) return 0n
            const pc = getPC(vc.chain)
            if (isToggled) {
                const btAmount = await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactPTforBT', args: [inputAssetBn] })
                if (isAddressEqual(vc.bt, output.address)) return btAmount
                return pc.readContract({ abi: abiBT, address: vc.bt, functionName: 'previewRedeem', args: [output.address, btAmount] })
            } else {
                const btAmount = isAddressEqual(vc.bt, input.address) ? inputAssetBn : await pc.readContract({ abi: abiBT, address: vc.bt, functionName: 'previewDeposit', args: [input.address, inputAssetBn] })
                return pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'quoteExactBTforPT', args: [btAmount] })
            }
        }
    })
    const errorInput = !isFetchingOut && inputAssetBn > 0 && outAmount == 0n ? 'Market liquidity is insufficient' : ''
    // isInputBT ? -outputBn : inputBn, isInputBT ? inputBn : -outputBn
    const [apy, apyto, priceimpcat] = usePTApy(vc, isToggled ? inputAssetBn : -outAmount, isToggled ? -outAmount : inputAssetBn)
    const onSwitch = () => {
        toggle()
    }
    const getTxs = async () => {
        if (isToggled) {
            const txsApproves = await withTokenApprove({
                approves: [{ spender: vc.vault, token: input.address, amount: inputAssetBn }],
                pc: getPC(vc.chain),
                user: address!,
                tx: {
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swapExactPTforBT',
                    args: [inputAssetBn, 0n, genDeadline()],
                }
            })
            const unwrapBTtxs = await unwrapBT({
                chainId: vc.chain,
                bt: vc.bt,
                btShareBn: outAmount,
                token: output.address,
                user: address!
            })
            return [...txsApproves, ...unwrapBTtxs]
        } else {
            const wrapBt = await wrapToBT({
                chainId: vc.chain,
                bt: vc.bt,
                inputBn: inputAssetBn,
                token: input.address,
                user: address!
            })
            const txsApprove = await withTokenApprove({
                approves: [{ spender: vc.vault, token: vc.bt, amount: wrapBt.sharesBn }],
                pc: getPC(vc.chain),
                user: address!,
                tx: {
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swapExactBTforPT',
                    args: [wrapBt.sharesBn, 0n, genDeadline()],
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
            <GetvIP address={bt.address} />
        </div>
        <TokenInput tokens={outputs} checkBalance={false} balance={false} onTokenChange={outputSetCT} disable amount={fmtBn(outAmount, output.decimals)} loading={isFetchingOut && inputAssetBn > 0n} />
        <div className="flex justify-between items-center text-xs font-medium">
            <div>Price: {swapPrice}</div>
            <div>Price Impact: {formatPercent(priceimpcat)}</div>
        </div>
        <div className="flex justify-between items-center text-xs font-medium opacity-60">
            <div>Implied APY Change: {formatPercent(apy)} → {formatPercent(apyto)}</div>
            <Fees fees={[{ name: 'Transaction Fees', value: 1.2 }, { name: 'Unstake Fees(Verio)', value: 1.2 }]} />
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
            const pc = getPC(vc.chain)
            const btAmount = isAddressEqual(vc.bt, input.address) ? inputAssetBn : (await pc.readContract({ abi: abiBT, address: vc.bt, functionName: 'previewDeposit', args: [input.address, inputAssetBn] }))
            return btAmount
        }
    })
    const txs = async (): Promise<TX[]> => {
        if (!address) return []
        const wrapBT = await wrapToBT({
            chainId: vc.chain,
            bt: vc.bt,
            inputBn: inputAssetBn,
            token: input.address,
            user: address!
        })
        const txsApprove = await withTokenApprove({
            approves: [{ spender: vc.vault, token: vc.bt, amount: wrapBT.sharesBn, }],
            pc: getPC(vc.chain), user: address,
            tx: { abi: abiBVault2, address: vc.vault, functionName: 'mintPTandYT', args: [wrapBT.sharesBn] }
        })
        return [...wrapBT.txs, ...txsApprove]
    }
    return <div className='flex flex-col gap-1'>
        <TokenInput tokens={tokens} onTokenChange={setCT} amount={inputAsset} setAmount={setInputAsset} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={vc.asset} />
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
    const tokens = useWrapBtTokens(vc)
    const [ct, setCT] = useState(tokens[0])
    const out = ct
    const pt = usePtToken(vc)!
    const yt = useYtToken(vc)!
    const ptBalance = useBalance(pt)
    const ytBalance = useBalance(yt)
    const outBalance = useBalance(out)
    const [input, setInput] = useState('')
    const inputBn = parseEthers(input)
    const [calcKey, setCalcKey] = useState<any[]>(['calcPTYTRedeemOut'])
    useDebounce(() => setCalcKey(['calcPTYTRedeemOut', inputBn, out]), 300, [inputBn, input])
    const { data: outAmount, isFetching: isFetchingOut } = useQuery({
        queryKey: calcKey,
        initialData: 0n,
        queryFn: async () => {
            if (inputBn <= 0n || setCalcKey.length == 1) return 0n
            const pc = getPC(vc.chain)
            const outAmount = isAddressEqual(vc.bt, out.address) ? inputBn : await pc.readContract({ abi: abiBT, address: vc.bt, functionName: 'previewRedeem', args: [out.address, inputBn] })
            return outAmount
        }
    })
    const getTxs = async () => {
        const redeemTxs = [{
            abi: abiBVault2,
            address: vc.vault,
            functionName: 'redeemByPTandYT',
            args: [inputBn]
        }]
        const unwrapBTtxs = await unwrapBT({
            chainId: vc.chain,
            bt: vc.bt,
            btShareBn: outAmount,
            token: out.address,
            user: address!
        })
        return [...redeemTxs, ...unwrapBTtxs]
    }
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={pt.symbol} amount={input} balance={ptBalance.result} setAmount={setInput} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={yt.symbol} amount={input} balance={ytBalance.result} setAmount={setInput} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={vc.asset} />
        </div>
        <TokenInput tokens={tokens} onTokenChange={setCT} disable amount={fmtBn(outAmount, out.decimals)} loading={isFetchingOut && inputBn > 0n} />
        <Txs
            className='mx-auto mt-4'
            tx='Redeem'
            disabled={inputBn <= 0n || inputBn < ptBalance.result || inputBn < ytBalance.result}
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
    const [apy] = usePTApy(vc)
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#10B98126] gap-5'>
                <CoinIcon size={48} symbol='PToken' />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{pt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>1 {pt.symbol} is equal to1 {asset.symbol} at maturity</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">{formatPercent(apy)}</div>
                <div className="text-xs font-semibold opacity-60">Fixed APY</div>
                <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                <div className="text-lg font-medium">{displayBalance(ptc.result, undefined, pt.decimals)}</div>
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
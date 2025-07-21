import { abiBT } from "@/config/abi/BVault2";
import { BVault2Config } from "@/config/bvaults2";
import { getTokenBy, Token } from "@/config/tokens";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { reFet } from "@/hooks/useFet";
import { fmtBn, formatPercent, handleError, parseEthers } from "@/lib/utils";
import { getPC } from "@/providers/publicClient";
import { displayBalance } from "@/utils/display";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDebounce, useToggle } from "react-use";
import { Address, isAddressEqual, parseAbi, SimulateContractParameters } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useBalance, useTotalSupply } from "../../hooks/useToken";
import { TX, Txs, withTokenApprove } from "../approve-and-tx";
import { GetByStoryHunt } from "../get-lp";
import { CoinIcon } from "../icons/coinicon";
import { TokenInput } from "../token-input";
import { Swap } from "../ui/bbtn";
import { useUnderlingApy } from "./useDatas";


export async function wrapToBT({ vc, token, inputBn, user }: { vc: BVault2Config, token: Address, inputBn: bigint, user: Address }) {
    let txs: TX[] = []
    let sharesBn = inputBn;
    if (!isAddressEqual(vc.bt, token)) {
        // to bt inputs
        let btinput = token
        const isExtToken = vc.extInputs.find(t => isAddressEqual(t.input, token) && vc.btInputs.find(address => isAddressEqual(address, t.out)))
        if (isExtToken) {
            txs = [...txs, ...(await withTokenApprove({
                approves: [{ token, spender: isExtToken.contract, amount: inputBn }], user, pc: getPC(vc.chain),
                tx: {
                    abi: parseAbi(['function stake(uint256 _amount) external']),
                    address: isExtToken.contract,
                    functionName: 'stake', args: [inputBn]
                }
            }))]
            btinput = isExtToken.out
        }
        if (!vc.btInputs.find(t => isAddressEqual(t, btinput))) throw new Error('input token error')
        // to bt
        sharesBn = await getPC(vc.chain).readContract({ abi: abiBT, address: vc.bt, functionName: 'previewDeposit', args: [btinput, inputBn] })
        txs = [...txs, ...(await withTokenApprove({
            approves: [{ token, spender: vc.bt, amount: inputBn }], user, pc: getPC(vc.chain),
            tx: { abi: abiBT, address: vc.bt, functionName: 'deposit', args: [user, btinput, inputBn, sharesBn * 99n / 100n] }
        }))]
    }
    return { txs, sharesBn }
}
export async function unwrapBT({ vc, token, btShareBn, user }: { vc: BVault2Config, token: Address, btShareBn: bigint, user: Address }) {
    if (!isAddressEqual(token, vc.bt)) {
        let btout = token
        const isExtToken = vc.extInputs.find(t => isAddressEqual(t.input, token) && vc.btInputs.find(address => isAddressEqual(address, t.out)))
        if (isExtToken) {
            btout = isExtToken.out;
        }
        const outBn = await getPC(vc.chain).readContract({ abi: abiBT, address: vc.bt, functionName: 'previewRedeem', args: [btout, btShareBn] })
        let txs = [{ abi: abiBT, address: vc.bt, functionName: 'redeem', args: [user, btShareBn, btout, outBn * 99n / 100n] }] as SimulateContractParameters[]
        if (isExtToken) {
            txs.push({
                abi: parseAbi(['function unstake(uint256 _amount) external']),
                address: isExtToken.contract,
                functionName: 'unstake',
                args: [outBn]
            })
        }
        return txs
    }
    return []
}

export function useWrapBtTokens(vc: BVault2Config, includeBt: boolean = true) {
    // const data = useFet({
    //     key: `btInputs${vc.bt}`,
    //     initResult: [vc.asset],
    //     fetfn: async () => getPC(vc.chain).readContract({ abi: abiBT, address: vc.bt, functionName: 'getTokensIn' })
    // })
    return useMemo(() => [...vc.extInputs.map(e => e.input), ...vc.btInputs, vc.bt].map(t => getTokenBy(t, vc.chain)!).filter(t => includeBt ? true : !isAddressEqual(t.address, vc.bt)), [vc, includeBt])
}

export function BT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)!
    const bt = getTokenBy(vc.bt, chainId)!
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: bt }).catch(handleError)
    }

    const tokens = useWrapBtTokens(vc, false)
    const [cToken, setCToken] = useState<Token>(tokens[0])
    const { address } = useAccount()
    const assetBalance = useBalance(asset)
    const btBalance = useBalance(bt)
    const btTotalSupply = useTotalSupply(bt)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const input = isToggled ? bt : cToken
    const output = isToggled ? cToken : bt
    const inputSetCT = (t: Token) => !isToggled && setCToken(t)
    const outputSetCT = (t: Token) => isToggled && setCToken(t)
    const [calcOutAmountKey, setCalcOutAmountKey] = useState<any[]>(['calcBTSwapOut'])
    useDebounce(() => setCalcOutAmountKey(['calcBTSwapOut', isToggled, inputAssetBn, input]), 300, [isToggled, inputAssetBn, input])
    const { data: outAmount, isFetching: isFetchingCalc } = useQuery({
        queryKey: calcOutAmountKey,
        initialData: 0n,
        queryFn: async () => {
            if (calcOutAmountKey.length <= 1) return 0n
            return getPC(vc.chain).readContract({ abi: abiBT, address: vc.bt, functionName: isToggled ? 'previewRedeem' : 'previewDeposit', args: [input.address, inputAssetBn] }).catch(() => inputAssetBn)
        }
    })
    const onSwitch = () => {
        toggle()
    }
    const getTxs = async () => {
        if (isToggled) {
            const unwrapTxs = await unwrapBT({
                vc,
                token: cToken.address,
                btShareBn: inputAssetBn,
                user: address!
            })
            return [...unwrapTxs]
        } else {
            const wrapBt = await wrapToBT({
                vc,
                token: cToken.address,
                inputBn: inputAssetBn,
                user: address!
            })
            return [...wrapBt.txs]
        }
    }
    const { result: unlerlingApy } = useUnderlingApy(vc)
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol={bt.symbol} />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{bt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>{bt.symbol} is a 1:1 wrapped version of the {asset.symbol}</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">{formatPercent(unlerlingApy)}</div>
                <div className="text-xs font-semibold opacity-60">Underlying APY</div>
                <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                <div className="text-lg font-medium">{displayBalance(btTotalSupply.result, undefined, bt.decimals)}</div>
            </div>
            <div className='flex px-2.5 pb-4'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>

        </div>
        <div className='card !p-4 flex flex-col gap-1'>
            <TokenInput tokens={isToggled ? [bt] : tokens} amount={inputAsset} setAmount={setInputAsset} onTokenChange={inputSetCT} />
            <Swap onClick={onSwitch} />
            <div className="flex justify-between items-center">
                <div className="font-bold">Receive</div>
                <GetByStoryHunt t={asset} />
            </div>
            <TokenInput disable tokens={isToggled ? tokens : [bt]} loading={isFetchingCalc && inputAssetBn > 0n} amount={fmtBn(outAmount, output.decimals)} onTokenChange={outputSetCT} />
            <Txs
                className='mx-auto mt-4'
                tx={isToggled ? 'Unwrap' : 'Wrap'}
                disabled={inputAssetBn <= 0n}
                txs={getTxs}
                onTxSuccess={() => {
                    setInputAsset('')
                    reFet(assetBalance.key, btBalance.key, btTotalSupply.key)
                }}
            />
        </div>
    </div>
}
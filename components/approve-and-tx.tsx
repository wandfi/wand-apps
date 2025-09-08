import { useApproves } from '@/hooks/useApprove'
import { useWrapContractWrite } from '@/hooks/useWrapContractWrite'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Abi, Account, Address, Chain, ContractFunctionArgs, ContractFunctionName, encodeFunctionData, erc20Abi, PublicClient, RpcSchema, SimulateContractParameters, WalletClient, zeroAddress } from 'viem'

import { useCurrentChainId, useNetworkWrong } from '@/hooks/useCurrentChainId'
import { cn, getErrorMsg, handleError, promiseT } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useMutation } from '@tanstack/react-query'
import { toast as tos } from 'sonner'
import { Transport, useSwitchChain, useWalletClient } from 'wagmi'
import { BBtn } from './ui/bbtn'
import { create } from 'zustand'
import { FaCheck, FaSpinner } from "react-icons/fa6";
import { getTokenBy } from '@/config/tokens'
import { SimpleDialog } from './simple-dialog'
import { isPROD, isTEST } from '@/constants'
import { Tip } from './ui/tip'

export function SwitchNet({ className }: { className?: string }) {
  const sc = useSwitchChain()
  const chainId = useCurrentChainId()
  return <BBtn
    className={twMerge('flex items-center justify-center gap-4 whitespace-nowrap min-w-[200px]', className)}
    onClick={() => sc.switchChainAsync({ chainId }).catch(console.error)}
    busy={sc.isPending}
    disabled={sc.isPending}>
    Switch Network
  </BBtn>
}
export function ApproveAndTx<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  chainOverride extends Chain | undefined,
  accountOverride extends Account | Address | undefined = undefined,
>({
  className,
  tx,
  busyShowTxet = true,
  approves,
  spender,
  requestAmount,
  config,
  toast = true,
  skipSimulate = false,
  disabled,
  confirmations,
  onTxSuccess,
  onApproveSuccess,
}: {
  className?: string
  tx: string
  busyShowTxet?: boolean
  approves?: { [k: Address]: bigint }
  spender?: Address
  requestAmount?: bigint
  config: SimulateContractParameters<abi, functionName, args, Chain, chainOverride, accountOverride> & {
    enabled?: boolean
  }
  toast?: boolean
  skipSimulate?: boolean
  disabled?: boolean
  confirmations?: number
  onTxSuccess?: () => void
  onApproveSuccess?: () => void
}) {
  const { write: doTx, isDisabled, isLoading: isTxLoading } = useWrapContractWrite(config as any, { onSuccess: () => onTxSuccess && onTxSuccess(), autoToast: toast, skipSimulate, confirmations })
  const txDisabled = disabled || isDisabled || isTxLoading || config.enabled === false
  const { approve, shouldApprove, loading: isApproveLoading, isSuccess: isApproveSuccess } = useApproves(approves || {}, spender, requestAmount)
  const onApproveSuccessRef = useRef<() => void>()
  onApproveSuccessRef.current = onApproveSuccess
  useEffect(() => {
    onApproveSuccessRef.current && isApproveSuccess && onApproveSuccessRef.current()
  }, [isApproveSuccess])

  const approveDisabled = disabled || !approve || isApproveLoading
  const isNetWrong = useNetworkWrong()
  if (isNetWrong) {
    return <SwitchNet className={className} />
  }
  if (shouldApprove)
    return (
      <BBtn className={twMerge('flex items-center justify-center gap-4', className)} onClick={approve} busy={isApproveLoading} disabled={approveDisabled}>
        Approve
      </BBtn>
    )
  return (
    <BBtn className={twMerge('flex items-center justify-center gap-4', className)} onClick={() => doTx()} busy={isTxLoading} busyShowContent={busyShowTxet} disabled={txDisabled}>
      {tx}
    </BBtn>
  )
}

export type TxConfig = SimulateContractParameters & { name?: string }
export type TX = TxConfig | (() => Promise<TxConfig>)
export const useTxsStore = create(() => ({ txs: [] as TxConfig[], progress: 0 }))

export function Txs({
  className, tx, txs, disabled, busyShowTxet = true, toast = true, disableSendCalls, disableProgress, skipSimulate = isPROD, onTxSuccess }:
  {
    className?: string, tx: string, disabled?: boolean, txs: TX[] | ((args: { pc: PublicClient, wc: WalletClient<Transport, Chain, Account, RpcSchema> }) => Promise<TX[]> | TX[]), busyShowTxet?: boolean, toast?: boolean,
    disableSendCalls?: boolean
    disableProgress?: boolean
    skipSimulate?: boolean
    onTxSuccess?: () => void
  }) {
  const { data: wc } = useWalletClient()
  const isNetwrong = useNetworkWrong()
  // const { sendCallsAsync } = useSendCalls()
  const chainId = useCurrentChainId()
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!wc) return
      const pc = getPC(chainId);
      const calls = await promiseT(txs, { wc, pc }).then(items => Promise.all(items.map(promiseT)))
      console.info('calls:', wc.account.address, calls)
      try {
        if (disableSendCalls) {
          throw new Error('disable wallet_sendCalls')
        }
        if (calls.length == 1) {
          throw new Error('calls length one wallet_sendCalls')
        }
        if (!skipSimulate) {
          await pc.simulateCalls({
            account: wc.account.address,
            calls: calls.map(item => ({ data: encodeFunctionData({ abi: item.abi, functionName: item.functionName, args: item.args }), to: item.address })),
          })
        }
        const { id } = await wc.sendCalls({
          account: wc.account.address,
          calls: calls.map(item => ({ data: encodeFunctionData({ abi: item.abi, functionName: item.functionName, args: item.args }), to: item.address })),
        })
        while (true) {
          const res = await wc.waitForCallsStatus({ id })
          if (res.status == 'pending') continue
          if (res.status == 'success') {
            toast && tos.success("Transactions Success")
            onTxSuccess?.()
          } else {
            throw new Error(`Transactions ${res.status} ${JSON.stringify(res)}`)
          }
          break
        }
      } catch (error) {
        const msg = getErrorMsg(error)
        const showTxsStat = !disableProgress && calls.length > 1
        if (msg && (msg.includes("Not supported batch request") || msg.includes('wallet_sendCalls') || msg.includes('EIP-7702 not supported'))) {
          let progress = 0;
          showTxsStat && useTxsStore.setState({ txs: calls, progress })
          for (const item of calls) {
            !skipSimulate && (await pc.simulateContract({ ...item, account: wc.account.address }))
            const tx = await wc.writeContract(item)
            const res = await pc.waitForTransactionReceipt({ hash: tx, confirmations: 2 })
            if (res.status !== 'success') throw new Error('Transactions Reverted')
            progress++
            showTxsStat && useTxsStore.setState({ progress })
          }
          toast && tos.success("Transactions Success")
          useTxsStore.setState({ progress: 0, txs: [] })
          onTxSuccess?.()
        } else {
          throw error
        }
      }
    },
    onError: (error) => {
      useTxsStore.setState({ progress: 0, txs: [] })
      toast && handleError(error)
    }
  })
  const txDisabled = disabled || isPending || (typeof txs !== 'function' && txs.length == 0) || !wc
  if (isNetwrong) return <SwitchNet className={className} />
  return <BBtn className={twMerge('flex items-center justify-center gap-4', className)} onClick={() => mutate()} busy={isPending} busyShowContent={busyShowTxet} disabled={txDisabled}>
    {tx}
  </BBtn>
}


export async function withTokenApprove({ approves, pc, user, tx }: {
  approves: { spender: Address, token: Address, amount: bigint, name?: string }[],
  pc: PublicClient
  user: Address,
  tx: TxConfig
}) {
  let nativeAmount = 0n;
  const needApproves = await Promise.all(approves.map(async item => {
    if (zeroAddress === item.token) {
      nativeAmount += item.amount;
      return null
    }
    const allowance = await pc.readContract({ abi: erc20Abi, address: item.token, functionName: 'allowance', args: [user, item.spender] })
    if (allowance >= item.amount) return null
    const name = item.name ?? `Approve ${getTokenBy(item.token, await pc.getChainId())!.symbol}`
    return { name, abi: erc20Abi, address: item.token, functionName: 'approve', args: [item.spender, item.amount] } as TxConfig
  })).then(txs => txs.filter(item => item !== null))
  return [...needApproves, { ...tx, ...(nativeAmount > 0n ? { value: nativeAmount } : {}) }]
}

export function TxsStat({ className }: { className?: string }) {
  const { txs, progress } = useTxsStore()
  if (txs.length == 0) return null
  return <SimpleDialog open disableClose className={cn('w-80 text-black dark:text-white flex flex-col gap-2 p-4', className)}>
    <div className='text-xl font-semibold'>Progress <Tip>Will require multiple signatures, this will be simplified into 1 approval with future updates!</Tip></div>
    <div className='flex flex-col gap-2 max-h-80 overflow-y-auto px-2.5'>
      {txs.map((tx, i) => <div key={`tx_item_stat_${i}`} className={cn('animitem flex items-center gap-5 bg-primary/20 px-4 py-2', { 'border-t border-black/20 dark:border-white/20': i > 0 })}>
        <span className='font-semibold'>{i + 1}</span>
        {tx.name ?? tx.functionName}
        <div className={cn('ml-auto text-xl', { 'animate-spin': progress == i })}>
          {progress == i && <FaSpinner />}
          {progress > i && <FaCheck className='text-green-500' />}
        </div>
      </div>)}
    </div>
    {/* <div className='opacity-80 text-center'>Will require multiple signatures, this will be simplified into 1 approval with future updates!</div> */}
  </SimpleDialog>
}
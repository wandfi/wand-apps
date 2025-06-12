import { useApproves, useNftApproves } from '@/hooks/useApprove'
import { useWrapContractWrite } from '@/hooks/useWrapContractWrite'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Abi, Account, Address, Chain, ContractFunctionArgs, ContractFunctionName, encodeFunctionData, SimulateContractParameters } from 'viem'

import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { getErrorMsg, handleError, promiseT } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useMutation } from '@tanstack/react-query'
import { toast as tos } from 'sonner'
import { useWalletClient } from 'wagmi'
import { BBtn } from './ui/bbtn'
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


export function NftApproveAndTx<
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
  approves?: { [k: Address]: true }
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

  const { approve, shouldApprove, loading: isApproveLoading, isSuccess: isApproveSuccess } = useNftApproves(approves ?? {}, spender)
  const onApproveSuccessRef = useRef<() => void>()
  onApproveSuccessRef.current = onApproveSuccess
  useEffect(() => {
    onApproveSuccessRef.current && isApproveSuccess && onApproveSuccessRef.current()
  }, [isApproveSuccess])

  const approveDisabled = disabled || !approve || isApproveLoading

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


export type TX = SimulateContractParameters | (() => Promise<SimulateContractParameters>)


export function Txs({
  className, tx, txs, disabled, busyShowTxet = true, toast = true, onTxSuccess }:
  {
    className?: string, tx: string, disabled?: boolean, txs: TX[] | (() => Promise<TX[]> | TX[]), busyShowTxet?: boolean, toast?: boolean
    onTxSuccess?: () => void
  }) {
  const { data: wc } = useWalletClient()
  // const { sendCallsAsync } = useSendCalls()
  const chainId = useCurrentChainId()
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!wc) return
      const calls = await promiseT(txs).then(items => Promise.all(items.map(promiseT)))
      console.info('calls:', wc.account.address, calls)
      try {
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
        if (msg && msg.includes('wallet_sendCalls')) {
          const pc = getPC(chainId)
          for (const item of calls) {
            const tx = await wc.writeContract(item)
            const res = await pc.waitForTransactionReceipt({ hash: tx, confirmations: 1 })
            if (res.status !== 'success') throw new Error('Transactions Reverted')
          }
          toast && tos.success("Transactions Success")
          onTxSuccess?.()
        }
      }
    },
    onError: toast ? handleError : () => { }
  })
  const txDisabled = disabled || isPending || (typeof txs !== 'function' && txs.length == 0) || !wc
  return <BBtn className={twMerge('flex items-center justify-center gap-4', className)} onClick={() => mutate()} busy={isPending} busyShowContent={busyShowTxet} disabled={txDisabled}>
    {tx}
  </BBtn>
}
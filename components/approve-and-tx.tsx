import { useApproves } from '@/hooks/useApprove'
import { useWrapContractWrite } from '@/hooks/useWrapContractWrite'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Abi, Account, Address, Chain, ContractFunctionArgs, ContractFunctionName, encodeFunctionData, erc20Abi, PublicClient, SimulateContractParameters, WalletClient, zeroAddress } from 'viem'

import { useCurrentChainId, useNetworkWrong } from '@/hooks/useCurrentChainId'
import { getErrorMsg, handleError, promiseT } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useMutation } from '@tanstack/react-query'
import { toast as tos } from 'sonner'
import { useSwitchChain, useWalletClient } from 'wagmi'
import { BBtn } from './ui/bbtn'


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


export function Txs({
  className, tx, txs, disabled, busyShowTxet = true, toast = true, disableSendCalls, disableProgress, onTxSuccess }:
  {
    className?: string, tx: string, disabled?: boolean, txs: TX[] | ((args: { pc: PublicClient, wc: WalletClient }) => Promise<TX[]> | TX[]), busyShowTxet?: boolean, toast?: boolean,
    disableSendCalls?: boolean
    disableProgress?: boolean
    onTxSuccess?: () => void
  }) {
  const { data: wc } = useWalletClient()
  const isNetwrong = useNetworkWrong()
  // const { sendCallsAsync } = useSendCalls()
  const chainId = useCurrentChainId()
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!wc) return
      const calls = await promiseT(txs, { wc, pc: getPC(chainId) }).then(items => Promise.all(items.map(promiseT)))
      console.info('calls:', wc.account.address, calls)
      try {
        if (disableSendCalls) {
          throw new Error('disable wallet_sendCalls')
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
        if (msg && (msg.includes('wallet_sendCalls') || msg.includes('EIP-7702 not supported'))) {
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
  if (isNetwrong) return <SwitchNet className={className} />
  return <BBtn className={twMerge('flex items-center justify-center gap-4', className)} onClick={() => mutate()} busy={isPending} busyShowContent={busyShowTxet} disabled={txDisabled}>
    {tx}
  </BBtn>
}


export async function withTokenApprove({ approves, pc, user, tx }: {
  approves: { spender: Address, token: Address, amount: bigint }[],
  pc: PublicClient
  user: Address,
  tx: SimulateContractParameters
}) {
  let nativeAmount = 0n;
  const needApproves = await Promise.all(approves.map(async item => {
    if (zeroAddress === item.token) {
      nativeAmount += item.amount;
      return null
    }
    const allowance = await pc.readContract({ abi: erc20Abi, address: item.token, functionName: 'allowance', args: [user, item.spender] })
    if (allowance >= item.amount) return null
    return { abi: erc20Abi, address: item.token, functionName: 'approve', args: [item.spender, item.amount] } as SimulateContractParameters
  })).then(txs => txs.filter(item => item !== null))
  return [...needApproves, { ...tx, ...(nativeAmount > 0n ? { value: nativeAmount } : {}) }]
}




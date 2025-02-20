import { useApproves, useNftApproves } from '@/hooks/useApprove'
import { useWrapContractWrite } from '@/hooks/useWrapContractWrite'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Abi, Account, Address, Chain, ContractFunctionArgs, ContractFunctionName, SimulateContractParameters } from 'viem'

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

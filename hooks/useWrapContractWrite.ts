import { getErrorMsg } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useState } from 'react'
import { toast } from 'sonner'
import { SimulateContractParameters, WalletClient } from 'viem'
import { useWalletClient } from 'wagmi'

export function useWrapContractWrite(
  config: SimulateContractParameters | (() => Promise<SimulateContractParameters>),
  opts?: {
    confirmations?: number
    skipSimulate?: boolean
    autoToast?: boolean
    onSuccess?: () => void
  },
) {
  const { autoToast = true, onSuccess } = opts || {}
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { data: wc } = useWalletClient()
  const isDisabled = !wc || !wc.account || isLoading || !config
  const write = async () => {
    if (isDisabled) return
    setIsLoading(true)
    setIsSuccess(false)
    try {
      const mconfig: SimulateContractParameters = (typeof config == 'function' ? await config() : config) as any
      const chainId = await wc.getChainId()
      const pc = getPC(chainId)
      let req: any = { account: wc.account, ...mconfig }
      if (!opts?.skipSimulate) {
        const res = await pc.simulateContract(req as any)
        req = res.request as any
      }
      const hash = await wc.writeContract(req)
      const txr = await pc.waitForTransactionReceipt({ hash, confirmations: opts?.confirmations })
      if (txr.status !== 'success') {
        throw 'Transaction reverted'
      }
      setIsSuccess(true)
      onSuccess && onSuccess()
      autoToast && toast.success('Transaction success')
      // wt.update()
    } catch (error) {
      autoToast && toast.error(getErrorMsg(error))
    }
    setIsLoading(false)
  }
  return {
    write,
    isDisabled,
    isLoading,
    isSuccess,
  }
}

export async function doTx(wc: WalletClient, config: SimulateContractParameters | (() => Promise<SimulateContractParameters>), confirmations: number = 3) {
  const mconfig = typeof config === 'function' ? await config() : config
  const pc = getPC(await wc.getChainId())
  const { request } = await pc.simulateContract({ account: wc.account, ...mconfig })
  const hash = await wc.writeContract(request)
  const txr = await pc.waitForTransactionReceipt({ hash, confirmations })
  return txr
}

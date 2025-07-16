import { useConfigChains } from '@/components/support-chains'
import { SUPPORT_CHAINS } from '@/config/network'
import { useChainId } from 'wagmi'

export function useCurrentChainId() {
  const chainId = useChainId()
  const { chains, def } = useConfigChains()
  const isSupported = chains.find((item) => item.id === chainId)
  return isSupported ? chainId : def
}

export function useNetworkWrong() {
  const chainId = useChainId()
  const { chains } = useConfigChains()
  const isSupported = chains.find((item) => item.id === chainId)
  return !isSupported
}

export function useCurrentChain() {
  const chianId = useCurrentChainId()
  return SUPPORT_CHAINS.find((item) => item.id == chianId)!
}

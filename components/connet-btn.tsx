import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { BBtn } from './ui/bbtn'

export default function ConnectBtn() {
  const { isConnected } = useAccount()
  const showConnect = !isConnected
  const cm = useConnectModal()
  if (showConnect)
    return (
      <BBtn className='mt-0 w-fit' onClick={() => cm.openConnectModal?.()}>
        <span className='font-medium text-sm px-5 whitespace-nowrap'>Connect Wallet</span>
      </BBtn>
    )
  return <ConnectButton chainStatus={'none'} showBalance={false} />
}

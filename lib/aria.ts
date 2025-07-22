import { abiAriaLegal } from '@/config/abi/third'
import { story } from '@/config/network'
import { Token } from '@/config/tokens'
import { Address, PublicClient, WalletClient } from 'viem'
import { getEip712Domain } from 'viem/actions'
import { promiseAll } from './utils'
const address: Address = '0x5E8291e5799277429eb26da2Ff0364f6C39701CD'
export async function withIfAiraSign({ pc, wc, token, user }: { pc: PublicClient; wc: WalletClient; token: Token; user: Address }) {
  if (token.symbol === 'APL' && token.chain.includes(story.id)) {
    const alreadySign = await pc.readContract({ abi: abiAriaLegal, address, functionName: 'hasSignedCurrentLicense', args: [user] })
    if (alreadySign) return
    const { licenseURI, contentURIHash } = await promiseAll({
      licenseURI: pc.readContract({ abi: abiAriaLegal, address, functionName: 'licenseURI' }),
      contentURIHash: pc.readContract({ abi: abiAriaLegal, address, functionName: 'contentURIHash' }),
    })
    const domains = await getEip712Domain(pc, { address })
    console.info('domains:', domains)
    const signature = await wc.signTypedData({
      account: user,
      domain: domains.domain,
      types: {
        SignLicense: [
          { type: 'string', name: 'licenseURI' },
          { type: 'bytes32', name: 'contentURIHash' },
        ],
      },
      primaryType: 'SignLicense',
      message: { licenseURI, contentURIHash },
    })
    console.info('signature:', user, signature)
    const { request } = await pc.simulateContract({ account: user, abi: abiAriaLegal, address, functionName: 'signLicense', args: [signature] })
    const hash = await wc.writeContract(request as any)
    await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
  }
}

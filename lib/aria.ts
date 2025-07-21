import { abiAriaLegal } from '@/config/abi/third'
import { story } from '@/config/network'
import { Token } from '@/config/tokens'
import { Address, PublicClient, WalletClient } from 'viem'
import { promiseAll } from './utils'
const address: Address = '0x5E8291e5799277429eb26da2Ff0364f6C39701CD'
export async function withIfAiraSign({ pc, wc, token, user }: { pc: PublicClient; wc: WalletClient; token: Token; user: Address }) {
  if (token.symbol === 'APL' && token.chain.includes(story.id)) {
    const alreadySign = await pc.readContract({ abi: abiAriaLegal, address, functionName: 'hasSignedCurrentLicense', args: [user] })
    if (alreadySign) return
    const { LicenseURI, ContentURIHash } = await promiseAll({
      LicenseURI: pc.readContract({ abi: abiAriaLegal, address, functionName: 'licenseURI' }),
      ContentURIHash: pc.readContract({ abi: abiAriaLegal, address, functionName: 'contentURIHash' }),
    })

    const signature = await wc.signTypedData({
      domain: {
        name: 'SignLicense',
        version: '1',
        chainId: story.id,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      types: {
        SignLicense: [
          { name: 'LicenseURI', type: 'string' },
          { name: 'ContentURIHash', type: 'bytes' },
        ],
      },
      primaryType: 'SignLicense',
      message: {
        LicenseURI,
        ContentURIHash,
      },
      account: user,
    })
    const { request } = await pc.simulateContract({ abi: abiAriaLegal, address, functionName: 'signLicense', args: [signature] })
    const hash = await wc.writeContract(request as any)
    await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
  }
}

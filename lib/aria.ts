import { abiAriaLegal, abiStakingAPL } from '@/config/abi/third'
import { story } from '@/config/network'
import { Token } from '@/config/tokens'
import { Address, PublicClient, WalletClient } from 'viem'
import { getEip712Domain, signTypedData } from 'viem/actions'
import { promiseAll } from './utils'
import { TokenConvert } from '@/config/bvaults2'
import { genBtConvert } from '@/components/bvaults2/bt'
import { getPC } from '@/providers/publicClient'
import { withTokenApprove } from '@/components/approve-and-tx'
const address: Address = '0x5E8291e5799277429eb26da2Ff0364f6C39701CD'

// useSignTypedData
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

    const signature = await signTypedData(wc, {
      account: user,
      domain: {
        name: domains.domain.name,
        version: domains.domain.version,
        chainId: domains.domain.chainId,
        verifyingContract: domains.domain.verifyingContract,
      },
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




const Decimal_27 = 10n ** 27n

export function genAplBtConvert(bt: Address): TokenConvert {
  const apl: Address = '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5'
  const stAPL: Address = '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639'
  const stakingAPL: Address = '0x73d600Db8E7bea28a99AED83c2B62a7Ea35ac477'
  const chain = story.id
  const tc_BT_stAPL = genBtConvert(story.id, bt, stAPL)
  const tc_APL_stAPL: TokenConvert = {
    tokens: [apl, stAPL],
    async previewConvert(isZeroToOne, amount) {
      const pc = getPC(chain)
      // ratio   stAPL:APL ratio - scaled by 10^27
      const raito = await pc.readContract({ abi: abiStakingAPL, address: stakingAPL, functionName: 'stIPRWAperIPRWA' })
      return isZeroToOne ? (amount * raito) / Decimal_27 : (amount * Decimal_27) / raito
    },
    async convertTxs(isZeroToOne, amount, user) {
      return withTokenApprove({
        pc: getPC(chain),
        user,
        approves: isZeroToOne ? [] : [],
        tx: {
          abi: abiStakingAPL,
          address: stakingAPL,
          functionName: isZeroToOne ? 'stake' : 'unstake',
          args: [amount],
        },
      })
    },
  }
  return {
    tokens: [apl, bt],
    async previewConvert(isZeroToOne, amount) {
      if (isZeroToOne) {
        return tc_BT_stAPL.previewConvert(isZeroToOne, await tc_APL_stAPL.previewConvert(isZeroToOne, amount))
      } else {
        return tc_APL_stAPL.previewConvert(isZeroToOne, await tc_BT_stAPL.previewConvert(isZeroToOne, amount))
      }
    },
    async convertTxs(isZeroToOne, amount, user) {
      if (isZeroToOne) {
        const stAplAmount = await tc_APL_stAPL.previewConvert(isZeroToOne, amount)
        return [...(await tc_APL_stAPL.convertTxs(isZeroToOne, amount, user)), ...(await tc_BT_stAPL.convertTxs(isZeroToOne, stAplAmount, user))]
      } else {
        const stAplAmount = await tc_BT_stAPL.previewConvert(isZeroToOne, amount)
        return [...(await tc_BT_stAPL.convertTxs(isZeroToOne, amount, user)), ...(await tc_APL_stAPL.convertTxs(isZeroToOne, stAplAmount, user))]
      }
    },
  }
}

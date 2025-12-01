import { withTokenApprove } from '@/components/approve-and-tx'
import { genBtConvert } from '@/components/bvaults2/bt'
import { abiAprStakingMON } from '@/config/abi/third'
import { TokenConvert } from '@/config/bvaults2'
import { monad } from '@/config/network'
import { getPC } from '@/providers/publicClient'
import { Address, zeroAddress } from 'viem'
export function genMonBtConvert(bt: Address): TokenConvert {
  const mon: Address = zeroAddress
  const aprMON: Address = '0x0c65A0BC65a5D819235B71F554D210D3F80E0852'
  const stakingMON: Address = '0x0c65A0BC65a5D819235B71F554D210D3F80E0852'
  const chain = monad.id
  const tc_aprMON_BT = genBtConvert(chain, bt, aprMON)
  const tc_MON_aprMON: TokenConvert = {
    token0: mon,
    token1: aprMON,
    async previewConvert(isZeroToOne, amount) {
      if (!isZeroToOne) return 0n
      const pc = getPC(chain)
      return pc.readContract({ abi: abiAprStakingMON, address: stakingMON, functionName: 'previewDeposit', args: [amount] })
    },
    async convertTxs(isZeroToOne, amount, user) {
      if (!isZeroToOne) return []
      return withTokenApprove({
        pc: getPC(chain),
        user,
        approves: [{ token: mon, amount, spender: stakingMON }],
        tx: {
          name: `Stake MON for aprMON`,
          abi: abiAprStakingMON,
          address: stakingMON,
          functionName: 'deposit',
          args: [amount, user],
        },
      })
    },
  }
  return {
    token0: mon,
    token1: bt,
    onlyZeroToOne: true,
    async previewConvert(isZeroToOne, amount) {
      if (isZeroToOne) {
        return tc_aprMON_BT.previewConvert(isZeroToOne, await tc_MON_aprMON.previewConvert(isZeroToOne, amount))
      } else {
        return 0n
      }
    },
    async convertTxs(isZeroToOne, amount, user) {
      if (isZeroToOne) {
        const aprMONAmount = await tc_MON_aprMON.previewConvert(isZeroToOne, amount)
        return [...(await tc_MON_aprMON.convertTxs(isZeroToOne, amount, user)), ...(await tc_aprMON_BT.convertTxs(isZeroToOne, aprMONAmount, user))]
      } else {
        return []
      }
    },
  }
}

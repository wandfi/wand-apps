import { Address } from 'viem'
import { sepolia } from 'viem/chains'
import { TypeENV } from './env'
import { proxyGetDef } from '@/lib/utils'

export type BVault2Config = {
  tit: string
  vault: Address
  asset: Address
  bt: Address
  market: Address
  mintpool: Address
  maturitypool: Address
  protocal: Address
  protocalSettings: Address
  hook: Address
  mockInfraredVault?: Address
  onEnv: TypeENV[]
}

export const BVAULTS2CONIG: { [k: number]: BVault2Config[] } = proxyGetDef(
  {
    [sepolia.id]: [
      {
        tit: 'vIP-Verio Vault',
        vault: '0x43020502bb2400e613a7e5ed94ba56928ba230bd',
        asset: '0x2b421fdf25ac7e21fd695ffb7c1ac72df15ca828',
        bt: '0xbf91828752703d8ca59ee509f61d883e8d67a49e',
        market: '0x868e12279d726519956fe1914dbd4bfecac3fd75',
        mintpool: '0x0ce482a39d46b9b22de39d9b4e59166576dea11c',
        maturitypool: '0xe4afa00dd8cf65d7261120c3d62d19c407c95138',
        protocal: '0x721364d98d12dc3fa0bc45af048deecac9f85fcb',
        protocalSettings: '0x024e01fd2ab129f944b9670d72ccdeaf08d7ce20',
        hook: '0x25de443a0b1b9d1eb135498a7c8d7383d3913a88',
        mockInfraredVault: '0x59228d72564c09410cedbc3bf3e8f70104594710',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

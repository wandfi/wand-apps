import { Address } from 'viem'
import { sepolia } from 'viem/chains'
import { TypeENV } from './env'
import { proxyGetDef } from '@/lib/utils'

export type BVault2Config = {
  tit: string
  vault: Address
  asset: Address
  bt: Address
  reward2: Address
  market: Address
  mintpool: Address
  maturitypool: Address
  protocal: Address
  protocalSettings: Address
  onEnv: TypeENV[]
}

export const BVAULTS2CONIG: { [k: number]: BVault2Config[] } = proxyGetDef(
  {
    [sepolia.id]: [
      {
        tit: 'vIP-Verio Vault',
        vault: '0x6Aa567D7EC7aaA39609394731C3C6fe0486Be958',
        asset: '0x38B40a5c2Dd2d62a7B578257A18A8F675353d481',
        bt: '0xe01C85599300f9ED5DE2d7D4FE3Dc2Dc4c5c3877',
        reward2: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aE',
        market: '0x2280c560B1d36eb40814F1E7489663C35B1BaDF0',
        mintpool: '0x4A2d5F3BaBF2ad41a723A8415a59a8a600CC1519',
        maturitypool: '0x0D7e86D8218de7c3A0109F3d5DCb8C6BBa055bf0',
        protocal: '0xB58DAfe606162a744F5007a49D928055Bcfb67Ed',
        protocalSettings: '0x776f5061F89Aa8df62f8E52688516Ab33E55b494',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

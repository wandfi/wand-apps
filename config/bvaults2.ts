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
        vault: '0x868a87931170e13fe23fa4b77556cce7fa70b086',
        asset: '0xa247358b5e3350354bacd8a15becb218d11a9a59',
        bt: '0xd4b290cbf95aa997f75f12a0aab4084869a10c4e',
        market: '0xadeddc0dadc4c69648f4f696b82ac022f130dc4a',
        mintpool: '0x769a79a41635a1df900d3f3f6951e2b3c69e0505',
        maturitypool: '0x10e27da2845d4951bb5df89723c9702affc4c6a8',
        protocal: '0x768c723e878740d988fa4e094ac8544f14f30193',
        protocalSettings: '0x49585913950de74fd499e1cae3879f137f5d2fa4',
        hook: '0x4f46eac8903bfd14b0e9135f2fe5fd4dbde83a88',
        mockInfraredVault: '0xc677fc5d95aad71223f5e68124a02ef07966263c',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

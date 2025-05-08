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
        vault: '0xB9498594054655667f35834FE30C432AfC92a922',
        asset: '0x67B02B199A45A6C158f7EC66eF01139432d4dCb0',
        bt: '0x63a211dF1d0450628EB1123657748f3f0C0272D6',
        reward2: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aE',
        market: '0xc0312Fab2663cCC0F7c43c05910B31002838F38f',
        mintpool: '0x4c0f596F658eA9027793c04e2173BB507766E956',
        maturitypool: '0x05463B42426D5c59020AF6faa6Df9fC4C55f2dda',
        protocal: '0x096ef6CB60B498Bb864CF493feBbB0d7936627B3',
        protocalSettings: '0x46B55D7265c3CD724c69aAA9a4E9193F69537cd5',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

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
  hook: Address
  onEnv: TypeENV[]
}

export const BVAULTS2CONIG: { [k: number]: BVault2Config[] } = proxyGetDef(
  {
    [sepolia.id]: [
      {
        tit: 'vIP-Verio Vault',
        vault: '0x9e98e6150d2ccd908fbd7d463219b9962c3942b9',
        asset: '0x6f01d0fe5329b8f5c8553ac7e75422fdd304c7c5',
        bt: '0xedef3c6573db3a48b8f7ddb9fa32f000dc6e89fe',
        reward2: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aE',
        market: '0x2bec00701287c4f721c607f72697df782f0c76c5',
        mintpool: '0x39c8080b6f228c5f41af89909361e8cc77e838ea',
        maturitypool: '0x8147cc09224747a0d22b0ec9cfd8720705d560f2',
        protocal: '0x6689f2b38658a221ea2792f023a1d034beec2a86',
        protocalSettings: '0xcba5e0d1528a22078b9a56f8a2047b948bae19dd',
        hook: '0x989947f1dc4bae3e0fa16429dcf04a343f653a88',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

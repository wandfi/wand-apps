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
        vault: '0xc627b57fe01017df26db0003e65faf416b8d770d',
        asset: '0xb09a8ba59615a552231cefcee80c3b88706597ed',
        bt: '0xf37b6ec18cee80634de01aef83701d6e726e7fc9',
        market: '0x4808b490a42df75e76b366833cafa2f1b6aab21d',
        mintpool: '0x71a7cc46193b0f0c011c20c7ac8ebd4ca60d9c2b',
        maturitypool: '0x670d23ee04a9d0ea28ed218f1dfb182cfbeb7051',
        protocal: '0xb9c720333e9b9bf8f3b07386dba730873a8f13bb',
        protocalSettings: '0xfcdb6aabf37b81c718beb260a9384312fe2c8a2c',
        hook: '0x0482851c6d27fcf8feff37074e62657c7e75fa88',
        mockInfraredVault: '0xccdf8f1205b61a43aece81f87957930032078e7b',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

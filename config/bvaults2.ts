import { Address } from 'viem'
import { sepolia, hashkeyTestnet } from 'viem/chains'
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
    [hashkeyTestnet.id]: [
      {
        tit: 'YTK Vault',
        vault: '0xfb0c36f93e2ed8c9045c19faded5e4b199ed9931',
        asset: '0xfa9eeeaf51a053bfb94643ad3d80837c661d99eb',
        bt: '0x8eeca063d0ec83b98f6af9008c535b1ca2c03e93',
        market: '0x282425c7fc8566b45ca18add90ba9ae7e4e875ae',
        mintpool: '0xbe824bfe01a78b5c42e0830ede7fb9fefabd6458',
        maturitypool: '0x767fe539b32a42fc5dbce5b20d8dea01da47ebd4',
        protocal: '0xd27adcd2f312e68ef93fdbe9278530833ce3c837',
        protocalSettings: '0x25bcf9957d6f186c3f1ddd0ce35853b16cb81639',
        hook: '0x66c07dd8f1d708f9a4d9926c7d492a0fe6c13a88',
        mockInfraredVault: '0x0383bb45ef1dff46e649563218c509628d5eca16',
        onEnv: ['test']
      }
    ]
  },
  [],
)

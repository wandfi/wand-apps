import { Address } from 'viem'
import { sepolia } from 'viem/chains'
import { TypeENV } from './env'

export type BVault2Config = {
  tit: string
  vault: Address
  asset: Address
  bt: Address
  mintpool: Address
  maturitypool: Address
  protocal: Address
  protocalSettings: Address
  hook: Address
  mockInfraredVault?: Address
  onEnv: TypeENV[]
  chain: number
}

export const BVAULTS2CONIG: BVault2Config[] = [
  {
    tit: 'YTK Vault1',
    vault: '0x4ef81ebe21ba222e434d76bbc00924619e11e604',
    asset: '0x7ab9c3a00073bc564f05feed4eb0a65a5073f88d',
    bt: '0x796defcd1c393c1620551b4cfb5a43944e86fb3f',
    mintpool: '0x123',
    maturitypool: '0x123',
    protocal: '0x0044a8ccf6003ec1529a1f621e533aee7141ac2c',
    protocalSettings: '0x236cdb4a8ff1cdbff8c387436e135796a92c03e5',
    hook: '0xfd031434e2b4d6df10f1608d5adf218d71097a88',
    mockInfraredVault: '0x03a0a0e615ce0de08706ed88785233d2548e6470',
    onEnv: ['test'],
    chain: sepolia.id,
  },
  {
    tit: 'YTK Vault2',
    vault: '0x62ad804e233275b9d6858a002e9890efc931345a',
    asset: '0x7ab9c3a00073bc564f05feed4eb0a65a5073f88d',
    bt: '0x796defcd1c393c1620551b4cfb5a43944e86fb3f',
    mintpool: '0x123',
    maturitypool: '0x123',
    protocal: '0x0044a8ccf6003ec1529a1f621e533aee7141ac2c',
    protocalSettings: '0x236cdb4a8ff1cdbff8c387436e135796a92c03e5',
    hook: '0xfc84818ea8715332c3d49064701c1cdef70efa88',
    mockInfraredVault: '0x03a0a0e615ce0de08706ed88785233d2548e6470',
    onEnv: ['test'],
    chain: sepolia.id,
  },
  // {
  //   tit: 'YTK Vault',
  //   vault: '0xfb0c36f93e2ed8c9045c19faded5e4b199ed9931',
  //   asset: '0xfa9eeeaf51a053bfb94643ad3d80837c661d99eb',
  //   bt: '0x8eeca063d0ec83b98f6af9008c535b1ca2c03e93',
  //   mintpool: '0xbe824bfe01a78b5c42e0830ede7fb9fefabd6458',
  //   maturitypool: '0x767fe539b32a42fc5dbce5b20d8dea01da47ebd4',
  //   protocal: '0xd27adcd2f312e68ef93fdbe9278530833ce3c837',
  //   protocalSettings: '0x25bcf9957d6f186c3f1ddd0ce35853b16cb81639',
  //   hook: '0x66c07dd8f1d708f9a4d9926c7d492a0fe6c13a88',
  //   mockInfraredVault: '0x0383bb45ef1dff46e649563218c509628d5eca16',
  //   onEnv: ['test'],
  //   chain: hashkeyTestnet.id,
  // },
]

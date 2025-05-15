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
        vault: '0x9e98e6150d2ccd908fbd7d463219b9962c3942b9',
        asset: '0x8bcf0d8468a733484b945173b73e2126167288b0',
        bt: '0xe1b53e90408ece0c76bd698ef98cdaccc7de8de0',
        market: '0xe362fd208ca99ba5bd86285d27ac899ccd66532d',
        mintpool: '0xfddb3aec297b75a21d21c9dcf3d78d093c0fd762',
        maturitypool: '0xadcc66c101818aacc9b99ea3e338959fadd56fd8',
        protocal: '0x19d1785d8fddc659bd1218c2b9bf74b568c82c8f',
        protocalSettings: '0xfe85817aeda1a3e3f3b896319e6d9cd2c2f3e981',
        hook: '0xb358647922faae86cf49b8ebe2b72687deea7a88',
        mockInfraredVault: '0xb6829e86f3a8c9bb94c7b346483e4786b3eb7cf2',
        onEnv: ['test'],
      },
    ],
  },
  [],
)

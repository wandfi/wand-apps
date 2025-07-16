import { Address } from 'viem'
import { sepolia } from 'viem/chains'
import { TypeENV } from './env'

export type BVault2Config = {
  tit: string
  vault: Address
  asset: Address
  bt: Address
  protocal: Address
  protocalSettings: Address
  hook: Address
  mockInfraredVault?: Address
  onEnv: TypeENV[]
  chain: number
  points?: string
  logs?: boolean
}

export const BVAULTS2CONIG: BVault2Config[] = [
  {
    tit: 'YTK Vault1',
    vault: '0x8e2fd9b36b9d1dea6b931f3492d26745daa195e3',
    asset: '0x97e733e8583169c3a8f8d18e0556b6567973c5b8',
    bt: '0xaca6abef41315da039f0025900bdbb2e85034325',
    protocal: '0x521ec0865129ddbefa6963ac2a5c4bf4d3ebf2d8',
    protocalSettings: '0xbfa4b61d2a75056521ee543d516374515221a9e8',
    hook: '0x4b5435453b6d6b61b61f129d11cb186d97bc7a88',
    mockInfraredVault: '0x2aba549ac8b3e79225b45bb2e94e99e42fe8ffeb',
    onEnv: ['test'],
    chain: sepolia.id,
    logs: true,
  },
  {
    tit: 'YTK Vault2',
    vault: '0xf6c73f08114556e523c6255fcd9a60dc0b01268a',
    asset: '0x97e733e8583169c3a8f8d18e0556b6567973c5b8',
    bt: '0xaca6abef41315da039f0025900bdbb2e85034325',
    protocal: '0x521ec0865129ddbefa6963ac2a5c4bf4d3ebf2d8',
    protocalSettings: '0xbfa4b61d2a75056521ee543d516374515221a9e8',
    hook: '0xb8b435fd066c3a0a78bbd83c59d0fee2c1db7a88',
    mockInfraredVault: '0x2aba549ac8b3e79225b45bb2e94e99e42fe8ffeb',
    onEnv: ['test'],
    chain: sepolia.id,
  },
]

import { TxConfig } from '@/components/approve-and-tx'
import { genBtConvert } from '@/components/bvaults2/bt'
import { genAplBtConvert } from '@/lib/aria'
import { Address } from 'viem'
import { TypeENV } from './env'
import { story } from './network'

export type TokenConvert = {
  tokens: [Address, Address]
  previewConvert: (isZeroToOne: boolean, amount: bigint) => Promise<bigint>
  convertTxs: (isZeroToOne: boolean, amount: bigint, user: Address) => Promise<TxConfig[]>
}

export type BVault2Config = {
  tit: string
  desc: string
  vault: Address
  asset: Address
  bt: Address
  btConverts: TokenConvert[]

  protocal: Address
  protocalSettings: Address
  hook: Address
  mockInfraredVault?: Address
  onEnv: TypeENV[]
  chain: number
  points?: { link?: string }
  logs?: boolean
  PIcon: string
  YIcon: string
}
const BTS = {
  APLVault: '0x773dd6686df237a7b3fe02632e91bd3664d81a0c' as Address,
  APLVault2: '0x1e0ca0e6bbf6b2e14c6e5360e430905759fd8677' as Address,
  APLVaultProd: '0x3bb7dc96832f8f98b8aa2e9f2cc88a111f96a118' as Address,
}
export const BVAULTS2CONIG: BVault2Config[] = [
  {
    tit: 'APL-Aria Vault',
    vault: '0xd589836c3c031e2238c25ad5c6a910794c8827ad',
    asset: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5',
    bt: BTS.APLVault,
    btConverts: [genAplBtConvert(BTS.APLVault), genBtConvert(story.id, BTS.APLVault, '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639')],
    protocal: '0x15489e8e4a9d0909c77560058a392c8dc89ff33c',
    protocalSettings: '0x2735dfe98587b16c737e770af8fa1c9c071cc62f',
    hook: '0x110477af9ac7837fd0e8a1b917982fd6065eba88',
    onEnv: ['test'],
    chain: story.id,
    logs: true,
    PIcon: 'pAPL',
    YIcon: 'yAPL',
    points: { link: 'https://app.ariaprotocol.xyz/points' },
    desc: `$APL is an IPRWA (Intellectual Property Real-World Asset) fungible token backed by a portfolio of real-world IP assets.   $APL enables token holders exposure to various royalty streams associated with the works, ranging from digital streaming, synchronization, mechanical and / or public performance revenues.`,
  },
  {
    tit: 'APL-Aria Vault',
    vault: '0xcc393c83e7ccb3313cbf2eb08199184b8f9fd1e5',
    asset: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5',
    bt: BTS.APLVault,
    btConverts: [genAplBtConvert(BTS.APLVault), genBtConvert(story.id, BTS.APLVault, '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639')],
    protocal: '0xc96979ae3c19166b43a0d225bb346909df24de81',
    protocalSettings: '0x75f7b53dd5e324866cb33099378d1a30923bd881',
    hook: '0xc4828140eab72d8d790feb90d42ab404e077ba88',
    onEnv: ['test'],
    chain: story.id,
    logs: true,
    PIcon: 'pAPL',
    YIcon: 'yAPL',
    points: { link: 'https://app.ariaprotocol.xyz/points' },
    desc: `$APL is an IPRWA (Intellectual Property Real-World Asset) fungible token backed by a portfolio of real-world IP assets.   $APL enables token holders exposure to various royalty streams associated with the works, ranging from digital streaming, synchronization, mechanical and / or public performance revenues.`,
  },
  {
    tit: 'APL-Aria Vault2',
    vault: '0xd41e7fa55876ba138bca6caaa374a03fc4229fe7',
    asset: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5',
    bt: BTS.APLVault2,
    btConverts: [genAplBtConvert(BTS.APLVault2), genBtConvert(story.id, BTS.APLVault2, '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639')],
    protocal: '0xa7c01f72291511a14d6a3c36938897236bdb8e98',
    protocalSettings: '0xe79b5680d5b4b163444c56f94f90f24451e4487e',
    hook: '0xe19fe3ce07afcf908fafb1e6e8370dc7750bfa88',
    onEnv: ['test'],
    chain: story.id,
    logs: true,
    PIcon: 'pAPL',
    YIcon: 'yAPL',
    points: { link: 'https://app.ariaprotocol.xyz/points' },
    desc: `$APL is an IPRWA (Intellectual Property Real-World Asset) fungible token backed by a portfolio of real-world IP assets.   $APL enables token holders exposure to various royalty streams associated with the works, ranging from digital streaming, synchronization, mechanical and / or public performance revenues.`,
  },
]

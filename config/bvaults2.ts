import { type TxConfig } from '@/components/approve-and-tx'
import { genBtConvert } from '@/components/bvaults2/bt'
import { genAplBtConvert } from '@/lib/aria'
import { type Address, parseEther } from 'viem'
import { type TypeENV } from './env'
import { monad, story } from './network'
import { genMonBtConvert } from '@/lib/apr'

export type TokenConvert = {
  token0: Address
  token1: Address
  onlyZeroToOne?: boolean
  previewConvert: (isZeroToOne: boolean, amount: bigint) => Promise<bigint>
  convertTxs: (isZeroToOne: boolean, amount: bigint, user: Address) => Promise<TxConfig[]>
}

export type BVault2Config = {
  tit: string
  subTitle: string
  desc: string
  vault: Address
  asset: Address
  bt: Address
  btPriceSymbol?: string
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
  bootsort?: number
  testnet?: boolean
  bootendblock?: bigint
  bootreward?: {
    amount: bigint
    tokenSymbol: string
  }
  underlingApy?: number
}
const BTS = {
  APLVault: '0x773dd6686df237a7b3fe02632e91bd3664d81a0c' as Address,
  APLVault2: '0x1e0ca0e6bbf6b2e14c6e5360e430905759fd8677' as Address,
  APLVaultProd: '0x3bb7dc96832f8f98b8aa2e9f2cc88a111f96a118' as Address,

  APRMonad: '0xc0685bb397eca74763b8b90738abf868a3502c21' as Address,
  APRMonadProd: '0x1aa50de111c4354f86816767b3f7a44d76b69c92' as Address,
}
export const BVAULTS2CONIG: BVault2Config[] = [
  {
    tit: 'APL-Aria',
    subTitle: '2025/09/04 (30days)',
    vault: '0x1e46583d9da2f28cea5d075c57d71d919353b3d9',
    asset: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5',
    bt: BTS.APLVaultProd,
    btConverts: [genAplBtConvert(BTS.APLVaultProd), genBtConvert(story.id, BTS.APLVaultProd, '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639')],
    protocal: '0x15489e8e4a9d0909c77560058a392c8dc89ff33c',
    protocalSettings: '0x2735dfe98587b16c737e770af8fa1c9c071cc62f',
    hook: '0x44d1d53433aaa6ab4325f90ee216b18f1ceafa88',
    onEnv: ['test', 'prod'],
    chain: story.id,
    logs: true,
    PIcon: 'pAPL',
    YIcon: 'yAPL',
    points: { link: 'https://app.ariaprotocol.xyz/points' },
    desc: `$APL is an IPRWA (Intellectual Property Real-World Asset) fungible token backed by a portfolio of real-world IP assets.   $APL enables token holders exposure to various royalty streams associated with the works, ranging from digital streaming, synchronization, mechanical and / or public performance revenues.`,
    bootsort: 2,
    underlingApy: 0.07
  },
  {
    tit: 'aprMON-aPrioir',
    subTitle: '2025/12/01 (30days)',
    vault: '0xd6cab3255653399773a5fb0d55b7236c39f28b4e',
    asset: '0x0c65A0BC65a5D819235B71F554D210D3F80E0852',
    bt: BTS.APRMonadProd,
    btPriceSymbol: 'MON',
    btConverts: [genMonBtConvert(BTS.APRMonadProd), genBtConvert(monad.id, BTS.APRMonadProd, '0x0c65A0BC65a5D819235B71F554D210D3F80E0852')],
    protocal: '0x840606225c454bc048f1620ff0a7ef2eb17e4e2a',
    protocalSettings: '0xf33aa073f7110f097fe41bbb2d581497084f9f5c',
    hook: '0x0d9476cb8f26e3fad5361b3952b38c63bde4fa88',
    onEnv: ['test', 'prod'],
    chain: monad.id,
    // logs: true,
    PIcon: 'paprMON',
    YIcon: 'yaprMON',
    desc: `aPriori is the leading MEV-powered liquid staking platform on Monad. We provide a simple way for users to earn MEV-boosted rewards on their Monad tokens. Users that stake with aPriori can use liquid tokens on a range of DeFi applications to gain extra rewards.`,
    bootendblock: 44514367n,
    bootreward: {
      amount: parseEther('1000'),
      tokenSymbol: 'APR',
    },
    underlingApy: 0.04
  },
]

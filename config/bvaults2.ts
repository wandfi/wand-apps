import { TxConfig } from '@/components/approve-and-tx'
import { genBtConvert } from '@/components/bvaults2/bt'
import { genAplBtConvert } from '@/lib/aria'
import { Address } from 'viem'
import { TypeENV } from './env'
import { monadTestnet, story } from './network'

export type TokenConvert = {
  tokens: [Address, Address]
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
}
const BTS = {
  APLVault: '0x773dd6686df237a7b3fe02632e91bd3664d81a0c' as Address,
  APLVault2: '0x1e0ca0e6bbf6b2e14c6e5360e430905759fd8677' as Address,
  APLVaultProd: '0x3bb7dc96832f8f98b8aa2e9f2cc88a111f96a118' as Address,

  APRMonad: '0xc0685bb397eca74763b8b90738abf868a3502c21' as Address,
}
export const BVAULTS2CONIG: BVault2Config[] = [
  {
    tit: 'APL-Aria Vault ',
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
  },
  {
    tit: 'APL-Aria Vault',
    subTitle: '2025/08/02 (30days)',
    vault: '0xd589836c3c031e2238c25ad5c6a910794c8827ad',
    asset: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5',
    bt: BTS.APLVaultProd,
    btConverts: [genAplBtConvert(BTS.APLVaultProd), genBtConvert(story.id, BTS.APLVaultProd, '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639')],
    protocal: '0x15489e8e4a9d0909c77560058a392c8dc89ff33c',
    protocalSettings: '0x2735dfe98587b16c737e770af8fa1c9c071cc62f',
    hook: '0x110477af9ac7837fd0e8a1b917982fd6065eba88',
    onEnv: ['test', 'prod'],
    chain: story.id,
    logs: true,
    PIcon: 'pAPL',
    YIcon: 'yAPL',
    points: { link: 'https://app.ariaprotocol.xyz/points' },
    desc: `$APL is an IPRWA (Intel lectual Property Real-World Asset) fungible token backed by a portfolio of real-world IP assets.   $APL enables token holders exposure to various royalty streams associated with the works, ranging from digital streaming, synchronization, mechanical and / or public performance revenues.`,
    bootsort: 2,
  },
  {
    tit: 'aprMON-aPrioir Vault(Testnet)',
    subTitle: '2025/09/24 (30days)',
    vault: '0xc0bcd558df01a1464221b2bed239a31ade10cd38',
    asset: '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A',
    bt: BTS.APRMonad,
    btConverts: [genBtConvert(monadTestnet.id, BTS.APRMonad, '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A')],
    protocal: '0x3197e1332cc522ea192f8288bbdd3da58b00ee89',
    protocalSettings: '0x85cd26a15f3e880232d56f11fbaa8e02ee405e4e',
    hook: '0xc9606aeccecc8b1fe6041cc9152cedde63e9ba88',
    onEnv: ['test','prod'],
    chain: monadTestnet.id,
    logs: true,
    PIcon: 'paprMON',
    YIcon: 'yaprMON',
    desc: `aPriori is the leading MEV-powered liquid staking platform on Monad. We provide a simple way for users to earn MEV-boosted rewards on their Monad tokens. Users that stake with aPriori can use liquid tokens on a range of DeFi applications to gain extra rewards.`,
  },
]

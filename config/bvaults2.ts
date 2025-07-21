import { Address } from 'viem'
import { TypeENV } from './env'
import { story } from './network'

export type BVault2Config = {
  tit: string
  desc: string
  vault: Address
  asset: Address
  bt: Address
  btInputs: Address[]
  extInputs: { input: Address; out: Address; contract: Address; }[]
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
  // {
  //   tit: 'YTK Vault1',
  //   vault: '0x8e2fd9b36b9d1dea6b931f3492d26745daa195e3',
  //   asset: '0x97e733e8583169c3a8f8d18e0556b6567973c5b8',
  //   bt: '0xaca6abef41315da039f0025900bdbb2e85034325',
  //   protocal: '0x521ec0865129ddbefa6963ac2a5c4bf4d3ebf2d8',
  //   protocalSettings: '0xbfa4b61d2a75056521ee543d516374515221a9e8',
  //   hook: '0x4b5435453b6d6b61b61f129d11cb186d97bc7a88',
  //   mockInfraredVault: '0x2aba549ac8b3e79225b45bb2e94e99e42fe8ffeb',
  //   onEnv: ['test'],
  //   chain: sepolia.id,
  //   logs: true,
  //   desc: `Verio is the liquid staking and IP asset restaking platform for Story. Users stake IP to receive vIP, a yield bearing LSD.
  //           vIP can be restaked on multiple IP Assets to earn profits, while YT holders can leverage profits through the vIP-Verio Vault.`,
  // },
  // {
  //   tit: 'YTK Vault2',
  //   vault: '0xf6c73f08114556e523c6255fcd9a60dc0b01268a',
  //   asset: '0x97e733e8583169c3a8f8d18e0556b6567973c5b8',
  //   bt: '0xaca6abef41315da039f0025900bdbb2e85034325',
  //   protocal: '0x521ec0865129ddbefa6963ac2a5c4bf4d3ebf2d8',
  //   protocalSettings: '0xbfa4b61d2a75056521ee543d516374515221a9e8',
  //   hook: '0xb8b435fd066c3a0a78bbd83c59d0fee2c1db7a88',
  //   mockInfraredVault: '0x2aba549ac8b3e79225b45bb2e94e99e42fe8ffeb',
  //   onEnv: ['test'],
  //   chain: sepolia.id,
  //   desc: `Verio is the liquid staking and IP asset restaking platform for Story. Users stake IP to receive vIP, a yield bearing LSD.
  //           vIP can be restaked on multiple IP Assets to earn profits, while YT holders can leverage profits through the vIP-Verio Vault.`,
  // },
  {
    tit: 'APL-Aria Vault',
    vault: '0xcc393c83e7ccb3313cbf2eb08199184b8f9fd1e5',
    asset: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5',
    bt: '0x773dd6686df237a7b3fe02632e91bd3664d81a0c',
    btInputs: ['0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639'],
    extInputs: [{ input: '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5', out: '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639', contract: '0x73d600Db8E7bea28a99AED83c2B62a7Ea35ac477' }],
    protocal: '0xc96979ae3c19166b43a0d225bb346909df24de81',
    protocalSettings: '0x75f7b53dd5e324866cb33099378d1a30923bd881',
    hook: '0xc4828140eab72d8d790feb90d42ab404e077ba88',
    // mockInfraredVault: '0x2aba549ac8b3e79225b45bb2e94e99e42fe8ffeb',
    onEnv: ['test'],
    chain: story.id,
    logs: true,
    desc: `$APL is an IPRWA (Intellectual Property Real-World Asset) fungible token backed by a portfolio of real-world IP assets.   $APL enables token holders exposure to various royalty streams associated with the works, ranging from digital streaming, synchronization, mechanical and / or public performance revenues.`,
  },
]

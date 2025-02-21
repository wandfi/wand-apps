import { Address } from 'viem'
import { story, storyTestnet } from './network'
import { TypeENV } from './env'

export type BVaultConfig = {
  vault: Address
  asset: Address
  assetSymbol: string
  pToken: Address
  pTokenSymbol: string
  yTokenSymbol: string
  protocolAddress: Address
  protocolSettingsAddress: Address
  yeetLiqSymbol?: string
  rewardSymbol?: string
  bQueryAddres: Address
  lpPoolIdx?: number
  isOld?: boolean
  onEnv?: TypeENV[]
}

export const ZooProtocolAddress: { [k: number]: Address } = {
  [storyTestnet.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
  [story.id]: '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
}
export const ZooProtocolSettingsAddress: { [k: number]: Address } = {
  [storyTestnet.id]: '0x97d82C639835F4EfaCC366fdE78CA0c4EC2a2A83',
  [story.id]: '0x8c6E434Bb1C51728BdCc250255c1F654471d85eB',
}
export const CrocQueryAddress: { [k: number]: Address } = {
  [storyTestnet.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
  [story.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
}

export const HONEY_Address: { [k: number]: Address } = {
  [storyTestnet.id]: '0x0e4aaf1351de4c0264c5c7056ef3777b41bd8e03',
  [story.id]: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
}
export const BQueryAddress: { [k: number]: Address } = {
  [storyTestnet.id]: '0xDf1126d3627b7f5D2a44d978A7180AcbD3c34aB6',
  [story.id]: '0x6E603014ACE3Ae06F34Ffe259106Af77c056d913',
}

export const BVAULTS_CONFIG: { [key: number]: BVaultConfig[] } = {
  [storyTestnet.id]: [
    {
      vault: '0x9700FEa232560E4048DD924623491926282125bE',
      asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
      pToken: '0x575287Cd8CB9A49e0EE00Bf0C71Eac337Ab8FeBa',
      assetSymbol: 'vIP',
      pTokenSymbol: 'pvIP',
      yTokenSymbol: 'yvIP',
      protocolAddress: ZooProtocolAddress[storyTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[storyTestnet.id],
      bQueryAddres: BQueryAddress[storyTestnet.id],
      onEnv: ['test'],
    },
  ],
  [story.id]: [
    {
      vault: '0x33C42E171cFD7Ec85D3dB34D7f6d3D8121f64E63',
      asset: '0xf961a8f6d8c69e7321e78d254ecafbcc3a637621',
      pToken: '0x70B851f6877D16D6D5aD546B17d06281b8aBDd4b',
      assetSymbol: 'vIP',
      pTokenSymbol: 'pvIP',
      yTokenSymbol: 'yvIP',
      protocolAddress: ZooProtocolAddress[story.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[story.id],
      bQueryAddres: BQueryAddress[story.id],
      onEnv: ['test', 'prod'],
    },
  ],
}

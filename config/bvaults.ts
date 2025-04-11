import { Address } from 'viem'
import { story, storyTestnet } from './network'
import { TypeENV } from './env'

export type BVaultConfig = {
  vault: Address
  asset: Address
  assetSymbol: string
  pToken: Address
  pTokenV2?: boolean
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
  ipAssetStaking: Address
}

export const ZooProtocolAddress: { [k: number]: Address } = {
  [storyTestnet.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
  [story.id]: '0x555ad3261c0eD6119Ab291b8dC383111d83C67c7',
}
export const ZooProtocolSettingsAddress: { [k: number]: Address } = {
  [storyTestnet.id]: '0x97d82C639835F4EfaCC366fdE78CA0c4EC2a2A83',
  [story.id]: '0xa6802e65C764712841330E58814Be43b6A4C3496',
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
  [story.id]: '0x413a55fe2CFD42799af68Cbd3514a55439B7cf5c',
}

export const VerioStakePool: { [k: number]: Address } = {
  [story.id]: '0xf6701A6A20639f0E765bA7FF66FD4f49815F1a27',
}

export const BVAULTS_CONFIG: { [key: number]: BVaultConfig[] } = {
  [storyTestnet.id]: [],
  [story.id]: [
    // {
    //   vault: '0x69048D97D7E080d491cf7E9a75c4E1FB236d31Ca',
    //   asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
    //   pToken: '0x8ce947b41F404e9b52191b35c12634FC1DA630C3',
    //   pTokenV2: true,
    //   assetSymbol: 'vIP',
    //   pTokenSymbol: 'pvIP',
    //   yTokenSymbol: 'yvIP',
    //   protocolAddress: '0x3f3e44fc9842F8bF64D8277D2559130191924B96',
    //   protocolSettingsAddress: '0x930Cc964A873ef4c1F6D2323e176104708f07f1B',
    //   bQueryAddres: BQueryAddress[story.id],
    //   onEnv: ['test'],
    // },
    {
      vault: '0x9B75cA5378d06cD1a5fB3B3ce9c3629665ca08d1',
      asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
      pToken: '0x32f07Aa2B32f2490b1A741391469a2fdda2e2ECe',
      pTokenV2: true,
      assetSymbol: 'vIP',
      pTokenSymbol: 'pvIP',
      yTokenSymbol: 'yvIP',
      protocolAddress: '0xa002E41BF35a84B51f3dfd1cD66A9Fd88eb06575',
      protocolSettingsAddress: '0x15c6F8eCbDe81aD2A03A238Bf382948196053a26',
      bQueryAddres: BQueryAddress[story.id],
      onEnv: ['test'],
      ipAssetStaking: '0x1ADd58A4bf810Bd706FE01458B610466F6e7f8cD',
    },
    {
      vault: '0xD763C6598f1Cf60c40Be07A401F84C2A2bD31da0',
      asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
      pToken: '0x6fded312e93E38FB7dD7D9AC5EF159F26047818D',
      pTokenV2: true,
      assetSymbol: 'vIP',
      pTokenSymbol: 'pvIP',
      yTokenSymbol: 'yvIP',
      protocolAddress: '0xf73DBFDdF6947E2d5cC49756F74f465E03E03143',
      protocolSettingsAddress: '0x96510E8ED6b9dCC9fc6378a239483f0cE0eB1327',
      bQueryAddres: BQueryAddress[story.id],
      onEnv: ['test'],
      ipAssetStaking: '0x1ADd58A4bf810Bd706FE01458B610466F6e7f8cD',
    },
    {
      vault: '0x72b3f85D0f1d05af9ea733DB3AD15d0ba9cB47b5',
      asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
      pToken: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d4',
      assetSymbol: 'vIP',
      pTokenSymbol: 'pvIP',
      yTokenSymbol: 'yvIP',
      protocolAddress: ZooProtocolAddress[story.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[story.id],
      bQueryAddres: BQueryAddress[story.id],
      onEnv: ['test', 'prod'],
      ipAssetStaking: '0xe9be8e0Bd33C69a9270f8956507a237884dff3BE'
    },
  ],
}

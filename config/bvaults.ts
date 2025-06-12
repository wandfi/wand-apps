import { Address } from 'viem'
import { story, storyTestnet } from './network'
import { TypeENV } from './env'
import { proxyGetDef } from '@/lib/utils'

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
  newUI?: boolean
  ipAssetStaking: Address
  compney: string
  icon?: string
  tit?: string
  sub?: string
  des?: string
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

export const BVAULTS_CONFIG: { [key: number]: BVaultConfig[] } = proxyGetDef(
  {
    [storyTestnet.id]: [],
    [story.id]: [
      {
        compney: 'Verio',
        vault: '0x29038303100931fA3Cd421ceb1632F1Bb22950Ac',
        asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
        pToken: '0x5e00cF234f4BD45542164EaF09A1D1D92C471Ed3',
        pTokenV2: true,
        assetSymbol: 'vIP',
        pTokenSymbol: 'pvIP',
        yTokenSymbol: 'yvIP',
        protocolAddress: '0xB5eD29BCf541aebcb3ee179cb590d92D3d9F9445',
        protocolSettingsAddress: '0x0b50513145a6cE1A8A93132881e6B29B3C04eEDe',
        bQueryAddres: BQueryAddress[story.id],
        onEnv: ['test', 'prod'],
        ipAssetStaking: '0x1ADd58A4bf810Bd706FE01458B610466F6e7f8cD',
      },
      {
        compney: 'Verio',
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
        ipAssetStaking: '0xe9be8e0Bd33C69a9270f8956507a237884dff3BE',
      },
      // {
      //   vault: '0x72b3f85D0f1d05af9ea733DB3AD15d0ba9cB47b5',
      //   asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
      //   pToken: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d4',
      //   assetSymbol: 'vIP',
      //   pTokenSymbol: 'pvIP',
      //   yTokenSymbol: 'yvIP',
      //   protocolAddress: ZooProtocolAddress[story.id],
      //   protocolSettingsAddress: ZooProtocolSettingsAddress[story.id],
      //   bQueryAddres: BQueryAddress[story.id],
      //   onEnv: ['test'],
      //   ipAssetStaking: '0xe9be8e0Bd33C69a9270f8956507a237884dff3BE',
      //   newUI: true,
      //   rewardSymbol: 'Spice Points',
      //   icon: 'GAIB',
      //   compney: 'GAIB',
      //   tit: 'GAIB AID Alpha',
      //   sub: 'Pre-deposit Campaign',
      //   des: 'AID Alpha is the initial launch phase of GAIB’s AI synthetic dollar, AID. During the campaign, users receive AID Alpha tokens which will later be redeemable 1:1 for mainnet AID tokens. AIDaUSDC is a receipt token from GAIB by depositing USDC into the AID Alpha pre-deposit campaign. ',
      // },
    ],
  },
  [],
)

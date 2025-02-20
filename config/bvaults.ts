import { Address } from 'viem'
import { berachain, berachainTestnet } from './network'
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
  [berachainTestnet.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
  [berachain.id]: '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
}
export const ZooProtocolSettingsAddress: { [k: number]: Address } = {
  [berachainTestnet.id]: '0x97d82C639835F4EfaCC366fdE78CA0c4EC2a2A83',
  [berachain.id]: '0x8c6E434Bb1C51728BdCc250255c1F654471d85eB',
}
export const CrocQueryAddress: { [k: number]: Address } = {
  [berachainTestnet.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
  [berachain.id]: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',
}

export const HONEY_Address: { [k: number]: Address } = {
  [berachainTestnet.id]: '0x0e4aaf1351de4c0264c5c7056ef3777b41bd8e03',
  [berachain.id]: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
}
export const BQueryAddress: { [k: number]: Address } = {
  [berachainTestnet.id]: '0xDf1126d3627b7f5D2a44d978A7180AcbD3c34aB6',
  [berachain.id]: '0x6E603014ACE3Ae06F34Ffe259106Af77c056d913',
}

export const BVAULTS_CONFIG: { [key: number]: BVaultConfig[] } = {
  [berachainTestnet.id]: [
    // new
    // {
    //   vault: '0x74D124D12B2ef774C99f6c304feD0A1aA7A797cB',
    //   asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
    //   assetSymbol: 'HONEY-WBERA',
    //   pToken: '0xF8362a475d72Cb257612Bf0F0A48558288fFe379',
    //   pTokenSymbol: 'pHONEY-BERA',
    //   yTokenSymbol: 'yHONEY-BERA',
    //   protocolAddress: ZooProtocolAddress,
    //   protocolSettingsAddress: ZooProtocolSettingsAddress,
    //   bQueryAddres: BQueryAddress[berachainTestnet.id],
    //   onEnv: ['beta'],
    // },
    {
      vault: '0x9700FEa232560E4048DD924623491926282125bE',
      asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
      assetSymbol: 'HONEY-WBERA',
      pToken: '0x575287Cd8CB9A49e0EE00Bf0C71Eac337Ab8FeBa',
      pTokenSymbol: 'pHONEY-BERA',
      yTokenSymbol: 'yHONEY-BERA',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: BQueryAddress[berachainTestnet.id],
      isOld: true,
      onEnv: ['beta'],
    },
    {
      vault: '0x5C88005534FB5C5B01445eC5bC944ebA0818554f',
      asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
      assetSymbol: 'HONEY-WBERA',
      pToken: '0x19f4cE524268a01bfAFf8B433110d8304b096be0',
      pTokenSymbol: 'pHONEY-BERA',
      yTokenSymbol: 'yHONEY-BERA',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: BQueryAddress[berachainTestnet.id],
      isOld: true,
      onEnv: ['beta'],
    },
    {
      vault: '0x9Ef9cE44c82111e967904059edf12701e17e6C03',
      asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
      assetSymbol: 'HONEY-WBERA',
      pToken: '0x0C2553919748093b0760EA825C85dc5a72142932',
      pTokenSymbol: 'pHONEY-BERA',
      yTokenSymbol: 'yHONEY-BERA',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: BQueryAddress[berachainTestnet.id],
      isOld: true,
      onEnv: ['beta', 'test'],
    },
    {
      vault: '0x77412b08bB3a8c38F7D0DC7D1158C5E7bfE03Eea',
      asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
      assetSymbol: 'HONEY-WBERA',
      pToken: '0x02FEDe9cf47c3D8aCE52613C2a45bC588D4e0516',
      pTokenSymbol: 'pHONEY-BERA',
      yTokenSymbol: 'yHONEY-BERA',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: '0xEE723BD0bC2449678d37177B7D93cc69D1af4B6F',
      onEnv: ['beta'],
    },
    {
      vault: '0xCC5AeD7b81dc45f02329Cc2Bf2c64B873D0be752',
      asset: '0xd28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
      assetSymbol: 'HONEY-WBERA',
      pToken: '0x05425F978a87DC80827f6c4a104FCbc6E9021ecc',
      pTokenSymbol: 'pHONEY-BERA',
      yTokenSymbol: 'yHONEY-BERA',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: '0xEE723BD0bC2449678d37177B7D93cc69D1af4B6F',
      onEnv: ['beta'],
    },
    {
      vault: '0x12f5F1f53B419d1E5F3084E649001Ff091683ADc',
      asset: '0x0001513F4a1f86da0f02e647609E9E2c630B3a14',
      assetSymbol: 'WBERA-YEET',
      pToken: '0x256938Bf1A340e6F80eAA35798b08a122783BEDF',
      pTokenSymbol: 'pWBERA-YEET',
      yTokenSymbol: 'yWBERA-YEET',
      rewardSymbol: 'WBERA-YEET',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: '0xEE723BD0bC2449678d37177B7D93cc69D1af4B6F',
      onEnv: ['beta'],
    },
    {
      vault: '0x6A2A4d8Fe425dC783e67b90d88922c5890BfA78c',
      asset: '0x0001513F4a1f86da0f02e647609E9E2c630B3a14',
      assetSymbol: 'WBERA-YEET',
      pToken: '0x890FDA8E5ce053D34aaA64B23d250f9AF04979e4',
      pTokenSymbol: 'pWBERA-YEET',
      yTokenSymbol: 'yWBERA-YEET',
      yeetLiqSymbol: 'LIQ-TRI-YEET',
      rewardSymbol: 'LIQ-TRI-YEET',
      protocolAddress: ZooProtocolAddress[berachainTestnet.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachainTestnet.id],
      bQueryAddres: '0xEE723BD0bC2449678d37177B7D93cc69D1af4B6F',
      onEnv: ['beta'],
    },
  ],
  [berachain.id]: [
    {
      vault: '0x33C42E171cFD7Ec85D3dB34D7f6d3D8121f64E63',
      asset: '0xf961a8f6d8c69e7321e78d254ecafbcc3a637621',
      assetSymbol: 'HONEY-USDC',
      pToken: '0x70B851f6877D16D6D5aD546B17d06281b8aBDd4b',
      pTokenSymbol: 'pHONEY-USDC',
      yTokenSymbol: 'yHONEY-USDC',
      protocolAddress: ZooProtocolAddress[berachain.id],
      protocolSettingsAddress: ZooProtocolSettingsAddress[berachain.id],
      bQueryAddres: BQueryAddress[berachain.id],
      onEnv: ['beta','test','prod'],
    }
  ],
}
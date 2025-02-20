import { Address } from 'viem'
import { sepolia } from 'viem/chains'
import { TypeENV } from './env'

export const WriteConfirmations = 3

export type LntVaultConfig = {
  vault: Address
  asset: Address // ERC721
  assetName: string
  assetLogo?: string
  assetSymbol: string // gen token symbol for asset
  vestingToken: Address
  vestingSymbol: string
  vestingDecimals: number
  vToken: Address // vesting token
  vTokenSymbol: string
  yTokenSymbol: string
  protocolAddress: Address
  protocolSettingsAddress: Address
  queryAddres: Address
  nftStakingPool: Address
  onEnv?: TypeENV[]
}
export const ZooProtocolAddress = '0x896774931349919B71Ec251CCbA1C6AB1FEb45C4'
export const ZooProtocolSettingsAddress = '0xD91C388453042a2214Ad085df76A9E08Bc701f23'

export const LNTQueryAddress: { [k: number]: Address } = {
  [sepolia.id]: '0x31C410AEF663FEbDD7A2F1cCF0a4487CDcD56fdA',
}

export const LNTVAULTS_CONFIG: { [key: number]: LntVaultConfig[] } = {
  [sepolia.id]: [
    {
      vault: '0xEF14D1D8128f496f798f6721713D41070F17A727',
      asset: '0x2020cAB606cF79169A0f3F6Eb3E710326C4a4C1B',
      assetName: 'Era NFT',
      assetSymbol: 'ERA',
      assetLogo: '',
      vestingToken: '0xa10519209B4F6c8Ec22Fda6733a103D3e24F4C39', // 流通的 vToken, for admin into vault;
      vestingSymbol: 'MkRC20',
      vestingDecimals: 18,
      vToken: '0x0A126144121Db990a066d63b02589D68104909cF', // For Vault mint and burn 
      vTokenSymbol: 'vERA',
      yTokenSymbol: 'yERA',
      protocolAddress: ZooProtocolAddress,
      protocolSettingsAddress: ZooProtocolSettingsAddress,
      queryAddres: LNTQueryAddress[sepolia.id],
      nftStakingPool: '0x73FA161A679020872356Eea8B6648F3D026228D1',
      onEnv: ['betalnt'],
    },
  ],
}

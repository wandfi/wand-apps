import { BVault2Config } from '@/config/bvaults2'

export const FetKEYS = {
  Logs: (chainId: number, vc: BVault2Config) => `Logs:${chainId}:${vc.vault}`,
  Bvault2Data: (chainid: number, vc: BVault2Config) => `vault2Data:${chainid}:${vc.vault}`,
}

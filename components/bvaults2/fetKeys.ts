import { BVault2Config } from '@/config/bvaults2'
import { reFet } from '@/hooks/useFet'
import { Address } from 'viem'

export const FetKEYS = {
  Logs: (chainId: number, vc: BVault2Config) => `Logs:${chainId}:${vc.vault}`,
  Bvault2Data: (chainid: number, vc: BVault2Config) => `vault2Data:${chainid}:${vc.vault}`,
  Bvault2Epochs: (vc: BVault2Config, epochCount: bigint = 0n) => (epochCount > 0n ? `vault2Data:epoches:${vc.vault}:${epochCount}` : ''),
  Bvualt2PTRedeems: (vc: BVault2Config, user?: Address, epochs: any[] = []) => (user && epochs.length > 0 ? `vault2Data:epochesPTRedeems:${vc.vault}:${user}` : ''),
  Bvault2YTRewards: (vc: BVault2Config, user?: Address, epochs: any[] = []) => (user && epochs.length > 0 ? `vault2Data:epochesRewardsForYT:${vc.vault}:${user}` : ''),
  Bvault2LPBTRewards: (vc: BVault2Config, user?: Address) => (user ? `vault2Data:RewardsForLPBT:${vc.vault}:${user}` : ''),
  BTPriceYt: (yt?: Address) => (yt ? `btPriceYt:${yt}` : ''),
  BTPriceUsd: (vc: BVault2Config) => `btPrice:${vc.bt}`,
  UnderlingApy: (vc: BVault2Config) => `underlingApy:${vc.asset}`,
}

export function reFetWithBvault2(chainId: number, vc: BVault2Config, ...keys: string[]) {
  reFet(FetKEYS.Bvault2Data(chainId, vc), FetKEYS.Logs(chainId, vc), ...keys)
}

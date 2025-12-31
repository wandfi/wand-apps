import { BVault2Config } from '@/config/bvaults2'
import { reFet } from '@/hooks/useFet'
import { Address } from 'viem'

export const FetKEYS = {
  Logs: (vc: BVault2Config) => `Logs:${vc.chain}:${vc.vault}`,
  Bvault2Data: (vc: BVault2Config) => `vault2Data:${vc.chain}:${vc.vault}`,
  Bvault2Epochs: (vc: BVault2Config, epochCount: bigint = 0n) => (epochCount > 0n ? `vault2Data:epoches:${vc.vault}:${epochCount}` : ''),
  Bvualt2PTRedeems: (vc: BVault2Config, user?: Address, epochs: any[] = []) => (user && epochs.length > 0 ? `vault2Data:epochesPTRedeems:${vc.vault}:${user}` : ''),
  Bvault2YTRewards: (vc: BVault2Config, user?: Address, epochs: any[] = []) => (user && epochs.length > 0 ? `vault2Data:epochesRewardsForYT:${vc.vault}:${user}` : ''),
  Bvault2LPBTRewards: (vc: BVault2Config, user?: Address) => (user ? `vault2Data:RewardsForLPBT:${vc.vault}:${user}` : ''),
  BTPriceYt: (yt?: Address) => (yt ? `btPriceYt:${yt}` : ''),
  BTPriceUsd: (vc: BVault2Config) => `btPrice:${vc.bt}:${vc.chain}`,
  UnderlingApy: (vc: BVault2Config) => `underlingApy:${vc.asset}`,
  BTPriceConvertToken: (vc: BVault2Config, token?: Address) => (token ? `BTPriceConvertToken:${vc.bt}:${token}` : ''),
  Bvault2TVL: (vc: BVault2Config) => `Bvualt2TVL:${vc.vault}`,
}

export function reFetWithBvault2(vc: BVault2Config, ...keys: string[]) {
  reFet(FetKEYS.Bvault2Data(vc), FetKEYS.Logs(vc), ...keys)
}

import { type Address } from 'viem';
import api from '../../utils/api';

export const getBvaultEpochYtPrices = (vault: Address, epochId: bigint) => api.get<{ price: string; time: number }[]>(`/api/bvault/getEpochYTPrices/${vault}/${epochId}`)
export const getLntVaultEpochYtPrices = (vault: Address, epochId: bigint) => api.get<{ price: string; time: number }[]>(`/api/lntvault/getEpochYTPrices/${vault}/${epochId}`)

export const getBvaultPtSynthetic = (vault: Address, epochId: bigint) => api.get<string>(`/api/bvault/getEpochPtSynthetic/${vault}/${epochId}`)

export const getBvaultsPtSynthetic = (bvaults: Address[] = []) => api.post<{ [k: Address]: string }>('/api/bvault/batchGetEpochPtSynthetic', { bvaults })

export const getLntVaultsDeposited = (vaults: Address[]) => api.post<{ [k: Address]: number }>('/api/lntvault/batchNfts', { vaults })

export type NFT_STAT = 'Deposited' | 'DepositedClaimed' | 'Redeemed'
export const getLntVaultNftStatByUser = (vault: Address, user: Address) => api.get<{ tokenId: string; stat: NFT_STAT; tx: Address }[]>(`/api/lntvault/${vault}/${user}/nftstat`)

export const getNftTokenIdsByUser = (token: Address, user: Address) => api.get<string[]>(`/api/nft/${token}/${user}/tokenIds`)
export const getNftTokensIdsByUser = (tokens: Address[], user: Address) => api.post<{ [k: Address]: string[] }>(`/api/nft/${user}/tokenIds`, { tokens })

export const getBvault2ChartsData = (vault: Address, start: bigint | number, end: bigint | number) =>
  api.get<{ ytPrice: string; ytRoi: string; ptPrice: string; ptApy: string; time: number }[]>(`/api/bvault/charts-data/${vault}/${start}/${end}`)

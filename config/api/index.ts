import { Address } from 'viem'
import api from '../../utils/api'
import axios from 'axios'
import { parseEthers } from '@/lib/utils'

export const getBvaultEpochYtPrices = (vault: Address, epochId: bigint) => api.get<{ price: string; time: number }[]>(`/api/bvault/getEpochYTPrices/${vault}/${epochId}`)
export const getLntVaultEpochYtPrices = (vault: Address, epochId: bigint) => api.get<{ price: string; time: number }[]>(`/api/lntvault/getEpochYTPrices/${vault}/${epochId}`)

export const getBvaultPtSynthetic = (vault: Address, epochId: bigint) => api.get<string>(`/api/bvault/getEpochPtSynthetic/${vault}/${epochId}`)

export const getBvaultsPtSynthetic = (bvaults: Address[] = []) => api.post<{ [k: Address]: string }>('/api/bvault/batchGetEpochPtSynthetic', { bvaults })

export const getLntVaultsDeposited = (vaults: Address[]) => api.post<{ [k: Address]: number }>('/api/lntvault/batchNfts', { vaults })

export type NFT_STAT = 'Deposited' | 'DepositedClaimed' | 'Redeemed'
export const getLntVaultNftStatByUser = (vault: Address, user: Address) => api.get<{ tokenId: string; stat: NFT_STAT; tx: Address }[]>(`/api/lntvault/${vault}/${user}/nftstat`)

export const getNftTokenIdsByUser = (token: Address, user: Address) => api.get<string[]>(`/api/nft/${token}/${user}/tokenIds`)
export const getNftTokensIdsByUser = (tokens: Address[], user: Address) => api.post<{ [k: Address]: string[] }>(`/api/nft/${user}/tokenIds`, { tokens })

export const getBeraTokensPrices = (
  tokens: Address[] = [
    '0x6969696969696969696969696969696969696969', // BERA,WBERA
    '0x0000000000000000000000000000000000000000', // BERA,WBERA
    '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', // HONEY
    '0x656b95E550C07a9ffe548bd4085c72418Ceb1dba', // BGT
    '0x549943e04f40284185054145c6E4e9568C1D3241', // USDC
    '0x779Ded0c9e1022225f8E0630b35a9b54bE713736', // USDT
    '0x688e72142674041f8f6Af4c808a4045cA1D6aC82', // BYUSD
    '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // WBTC, 
    '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590', // WETH,
    '0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5', // iBERA
    '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b', // iBGT
  ],
) =>
  axios
    .post<{
      data: {
        tokenGetCurrentPrices: {
          address: Address
          chain: 'BERACHAIN'
          price: number
          updatedAt: number
          updatedBy: string
          __typename: string
        }[]
      }
    }>('https://chgbtcc9ffu7rbdw2kmu4urwy.stellate.sh/', {
      operationName: 'GetTokenCurrentPrices',
      variables: {
        chains: ['BERACHAIN'],
        addressIn: tokens,
      },
      query:
        'query GetTokenCurrentPrices($chains: [GqlChain!]!, $addressIn: [String!]!) {\n  tokenGetCurrentPrices(chains: $chains, addressIn: $addressIn) {\n    address\n    chain\n    price\n    updatedAt\n    updatedBy\n    __typename\n  }\n}',
    })
    .then((res) => {
      const prices = res.data.data.tokenGetCurrentPrices
      const priceDataMap: {
        [k: Address]: {
          address: Address
          chain: 'BERACHAIN'
          price: number
          updatedAt: number
          updatedBy: string
          __typename: string
        }
      } = {}
      for (const price of prices) {
        priceDataMap[price.address] = price
      }
      const priceMap: { [k: Address]: bigint } = {}
      for (const token of tokens) {
        const pd = priceDataMap[token.toLowerCase() as Address]
        if(pd){
          priceMap[token] = parseEthers(pd.price.toFixed(6))
        }
      }
      return priceMap
    })

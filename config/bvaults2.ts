import { Address } from 'viem'
import { story } from './network'

export type BVault2Config = {
  tit: string
  vault: Address
  asset: Address
  pt: Address
  yt: Address
  lp: Address
  bt: Address
  reward2: Address
}

export const BVAULTS2CONIG: { [k: number]: BVault2Config } = {
  [story.id]: {
    tit: 'vIP-Verio Vault',
    vault: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aF',
    asset: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD',
    pt: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d4',
    yt: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d7',
    lp: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d5',
    bt: '0xADb174564F9065ce497a2Ff8BEC62b21e8b575d6',
    reward2: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aE',
  },
}

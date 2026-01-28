import { abiBvault2Query } from '@/config/abi/BVault2'
import { codeBvualt2Query } from '@/config/abi/codes'
import type { BVault2Config } from '@/config/bvaults2'

import { isPROD } from '@/config/env'
import { getPC } from '@/providers/publicClient'
import { mapValues } from 'es-toolkit'
import { type Address, erc20Abi } from 'viem'
import { fromJson, toJson } from './bnjson'
import { fmtBn, retry } from './utils'

export function saveLogs(item: any, key: string = 'logs') {
  const str = localStorage.getItem(key)
  const data: [string, any][] = fromJson(str || '[]')
  const date = new Date()
  const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  data.push([time, item])
  localStorage.setItem(key, toJson(data))
}

export function getLogsBy(user: Address) {
  const str = localStorage.getItem(`${user.toLocaleLowerCase()}_logs`)
  const data: [string, any][] = JSON.parse(str || '[]')
  return data
}

export async function logUserAction(vc: BVault2Config, user: Address, action: string) {
  if (isPROD) return
  retry(
    async () => {
      if (vc.logs) {
        const pc = getPC(vc.chain)
        const [log, Share] = await Promise.all([
          pc.readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'getLog', args: [vc.vault] }),
          pc.readContract({ abi: erc20Abi, address: vc.hook, functionName: 'balanceOf', args: [user] }),
        ])
        const data = mapValues(log, (item) => fmtBn(item, 18))
        saveLogs(
          {
            action,
            status: { ...data, Share: fmtBn(Share, 18) },
          },
          `${user.toLocaleLowerCase()}_logs`,
        )
      }
    },
    3,
    1000,
  )
}

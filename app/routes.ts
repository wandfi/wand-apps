import { tabToSearchParams } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { type Address } from 'viem'

export function toBVault(to: ReturnType<typeof useNavigate>, vault?: Address, tab?: string, subtab?: string) {
  to({
    to: '/yield-vault',
    search: {
      vault,
      tab: tab ? tabToSearchParams(tab) : undefined,
      subtab: subtab ? tabToSearchParams(subtab) : undefined,
    },
  })
}

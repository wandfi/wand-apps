import { getTokenPricesBySymbol } from '@/config/api'
import { DECIMAL } from '@/src/constants'
import { proxyGetDef } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { type Address } from 'viem'



const initialData = proxyGetDef<{ [k: Address]: bigint }>(
  {
    '0x549943e04f40284185054145c6E4e9568C1D3241': DECIMAL,
    '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce': DECIMAL,
    '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42': DECIMAL,
    '0xF1815bd50389c46847f0Bda824eC8da914045D14': DECIMAL,
    '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5': DECIMAL,
    '0x773dd6686df237a7b3fe02632e91bd3664d81a0c': DECIMAL,
    '0x1e0ca0e6bbf6b2e14c6e5360e430905759fd8677': DECIMAL,
    '0x3bb7dc96832f8f98b8aa2e9f2cc88a111f96a118': DECIMAL,
  },
  0n,
)
export function useTokenPrices() {
  return useQuery({
    queryKey: ['tokensPrices'],
    initialData,
    queryFn: async () => {
      const prices = await getTokenPricesBySymbol(['IP', 'MON'])
      return { ...initialData, '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD': prices[0].price, '0x1aa50de111c4354f86816767b3f7a44d76b69c92': prices[1].price }
    },
  })
}



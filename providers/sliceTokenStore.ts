import { fetRouter } from '@/lib/fetRouter'
import { initialTokenPrices, type fetTokenPrices } from '@/lib/fetsToken'
import { useQuery } from '@tanstack/react-query'


export function useTokenPrices() {
  return useQuery({
    queryKey: ['tokensPrices'],
    initialData: initialTokenPrices,
    queryFn: async () => (fetRouter('/api/token', { fet: 'fetTokenPrices' }) as ReturnType<typeof fetTokenPrices>).then(map => {
      map['vIP'] = map['IP']
      map['baprMON'] = map['MON']
      return map
    }),
  })
}



export type Conifg = {
  cacheTime?: number // default 1000
  retry?: number // default 3
  retryInterval?: number // default 500
}

export type FetBase<RES> = {
  key: string
  fetfn: () => Promise<RES>
  onError?: (err: Error) => void
} & Conifg

export type FetWithInit<RES> = FetBase<RES> & { initResult: RES }
export type Fet<RES> = FetBase<RES> | FetWithInit<RES>
type FetRes<FET = Fet<any>> = FET extends FetWithInit<infer RES1> ? RES1 : FET extends FetBase<infer RES2> ? RES2 | undefined : never

export type FetStatus = 'idle' | 'fetching' | 'success' | 'error'
export type FetStat<FET = Fet<any>> = {
  key: string
  status: FetStatus
  result: FetRes<FET>
  lastUpDate: number
  error?: Error
}

export type MergeFetStat<RES extends {}> = Omit<FetStat<Fet<RES>>, 'key'> & { key: string[] }
export type AllFetStat<RES extends {}> = FetStat<Fet<RES>> | MergeFetStat<RES>

declare function useMerge<R1 extends {}, R2 extends {}>(s1: AllFetStat<R1>, s2: AllFetStat<R2>): MergeFetStat<R1 & R2>
declare function useMerge<R1 extends {}, R2 extends {}, R3 extends {}>(s1: AllFetStat<R1>, s2: AllFetStat<R2>, s3: AllFetStat<R3>): MergeFetStat<R1 & R2 & R3>
declare function useMerge<R1 extends {}, R2 extends {}, R3 extends {}, R4 extends {}>(
  s1: AllFetStat<R1>,
  s2: AllFetStat<R2>,
  s3: AllFetStat<R3>,
  s4: AllFetStat<R4>,
): MergeFetStat<R1 & R2 & R3 & R4>
declare function useMerge<R1 extends {}, R2 extends {}, R3 extends {}, R4 extends {}, R5 extends {}>(
  s1: AllFetStat<R1>,
  s2: AllFetStat<R2>,
  s3: AllFetStat<R3>,
  s4: AllFetStat<R4>,
  s5: AllFetStat<R5>,
): MergeFetStat<R1 & R2 & R3 & R4 & R5>

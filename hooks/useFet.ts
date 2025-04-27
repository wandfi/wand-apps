import { sleep } from '@/lib/utils'
import EventEmitter from 'events'
import { useEffect, useReducer } from 'react'
/******************************************************** types *********************************************************************** */
export type Conifg = {
  cacheTime?: number // default 1000
  retry?: number // default 3
  retryInterval?: number // default 500
}

export type FetBase<RES> = {
  key: string
  fetch: () => Promise<RES>
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

/******************************************************** impl *********************************************************************** */

// Manager all fets
const fets: {
  [k: string]: {
    fet: Fet<any>
    fs: FetStat<Fet<any>>
    promise: Promise<any>
  }
} = {}

function initFS<FET extends Fet<any>>(fet: FET): FetStat<FET> {
  return {
    key: fet.key,
    status: 'idle',
    result: (fet as FetWithInit<any>).initResult,
    lastUpDate: 0,
  }
}

function isOldFetStat(fet: Fet<any>) {
  const fs = fets[fet.key]?.fs
  const cacheTime = fet.cacheTime ?? 1000
  if (fet.key && fs && fs.status !== 'fetching' && now() - fs.lastUpDate > cacheTime) {
    return true
  }
  return false
}

const emiter = new EventEmitter()
function sub<T>(fet: Fet<T>, onChange: (fs: FetStat<Fet<T>>) => void) {
  if (fet.key) {
    emiter.on(fet.key, onChange)
    return () => {
      emiter.off(fet.key, onChange)
    }
  } else {
    return () => {}
  }
}
async function runFetImpl<T>(fet: Fet<T>) {
  let retryCount = fet.retry ?? 3
  while (retryCount > 0) {
    retryCount--
    try {
      const res = await fet.fetch()
      fets[fet.key].fs.result = res as any
      fets[fet.key].fs.lastUpDate = now()
      fets[fet.key].fs.status = 'success'
      emiter.emit(fet.key, fets[fet.key].fs)
      return res
    } catch (err: any) {
      if (retryCount == 0) {
        fets[fet.key].fs.status = 'error'
        fets[fet.key].fs.error = err
        emiter.emit(fet.key, fets[fet.key].fs)
      }
      console.error(`RunFetError: fetKey:${fet.key} retryCount:${retryCount}`, err)
      await sleep(fet.retryInterval ?? 500)
    }
  }
}

export function runFet<T>(fet: Fet<T>): FetStat<Fet<T>> {
  if (fets[fet.key]) {
    fets[fet.key].promise = runFetImpl(fet)
  } else {
    fets[fet.key] = {
      fet,
      fs: initFS(fet),
      promise: runFetImpl(fet),
    }
  }
  fets[fet.key].fs.status = 'fetching'
  fets[fet.key].fs.error = undefined
  return fets[fet.key].fs
}

function now() {
  return new Date().getTime()
}

const updateReducer = (num: number) => (num + 1) % 1_000_000
export function useUpdate() {
  const [, update] = useReducer(updateReducer, 0)
  return update
}

export function useFet<FET extends Fet<any>>(fet: FET): FetStat<FET> {
  const update = useUpdate()
  let fetStat = fets[fet.key]?.fs
  const needRunFet = Boolean(fet.key) && (!fetStat || fetStat.status == 'idle')
  if (needRunFet) {
    fetStat = runFet(fet)
  }
  useEffect(() => {
    const unSub = sub(fet, (fs) => {
      fetStat = fs
      update()
    })
    // check need fresh
    if (isOldFetStat(fet)) {
      runFet(fet)
      update()
    }
    return unSub
  }, [fet.key])
  return fetStat
}

export function isFetching(status: FetStatus) {
  return status === 'fetching'
}

/******************************************************** examples *********************************************************************** */

function useGETDATA() {
  const { result: res1 } = useFet({ key: '123', fetch: async () => 123 })
  const { result: res2 } = useFet({ key: '123', initResult: 1, fetch: async () => 123 })
}

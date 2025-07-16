import _ from 'lodash'
import { useMemo } from 'react'
import { create } from 'zustand'
import { sliceBVaultsStore } from './sliceBVaultsStore'
import { sliceTokenStore } from './sliceTokenStore'
import { sliceUserBVaults } from './sliceUserBVaults'

type SliceType<T> = { [k in keyof T]: (set: (data: Partial<T[k]>) => void, get: () => T[k], init?: Partial<T[k]>) => T[k] }

function sliceStores<T>(slices: SliceType<T>, init: Partial<T> = {}) {
  return (set: (data: Partial<T>) => void, get: () => T) => {
    return _.mapValues(slices, (value, key) =>
      value(
        (data) => set({ [key as keyof T]: { ...get()[key as keyof T], ...data } } as any),
        () => get()[key as keyof T],
        init[key as keyof T],
      ),
    ) as T
  }
}
const boundStore = sliceStores(
  {
    sliceBVaultsStore,
    sliceTokenStore,
    sliceUserBVaults,
  },
  {}, // restore data
)

// const wrapDevtools = devtools(boundStore, { name: 'BoundStore', store: 'BoundStore', enabled: true })
export type BoundStoreType = ReturnType<typeof boundStore>

export const useBoundStore = create<BoundStoreType>(boundStore)

type KKeys<T> = Extract<keyof T, string | number | bigint>
type LKeys<T, K extends KKeys<T>> = T[K] extends any[] ? K : `${K}.${KKeys<T[K]>}`
type EK<T> = { [K in KKeys<T>]: LKeys<T, K> }[KKeys<T>]
type Paths<T> = { [K in KKeys<T>]: `${K}.${EK<T[K]>}` }[KKeys<T>] | EK<T> | KKeys<T>

export function useStore<T>(selector: (s: BoundStoreType) => T, dependsPaths: ('' | Paths<BoundStoreType>)[] = ['']) {
  const store = useBoundStore()
  return useMemo(
    () => selector(store),
    dependsPaths.map((path) => (!path ? store : _.get(store, path))),
  )
}

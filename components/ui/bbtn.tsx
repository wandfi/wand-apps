import { cn } from '@/lib/utils'
import _ from 'lodash'
import { ButtonHTMLAttributes, useEffect, useRef, useState } from 'react'
import { Spinner } from '../spinner'

// export function BorderDraw() {
//   const ref = useRef<HTMLCanvasElement>(null)
//   useEffect(() => {
//     let animHandler: number = 0
//     if (ref.current) {
//       const width = ref.current.clientWidth
//       const height = ref.current.clientHeight

//       requestAnimationFrame((time) => {

//       })
//     }
//     return () => {
//       animHandler && cancelAnimationFrame(animHandler)
//     }
//   }, [ref.current])
//   return <canvas ref={ref} />
// }

export function BBtn(p: ButtonHTMLAttributes<HTMLButtonElement> & { borderWidth?: number; busy?: boolean; busyShowContent?: boolean; hiddenBorder?: boolean }) {
  const { borderWidth = 1, children, busy, busyShowContent = true, className, hiddenBorder, ...props } = p
  const btnRef = useRef<HTMLButtonElement>(null)
  const [_size, setSize] = useState('0_0')
  let clipPath = 'unset'
  let borderBg = 'unset'
  if (btnRef.current && !hiddenBorder) {
    const element = btnRef.current
    const width = element.clientWidth
    const height = element.clientHeight
    const raidus = parseInt(getComputedStyle(element).borderRadius.replace('px', ''))
    const Q1 = `A${raidus - borderWidth} ${raidus - borderWidth} 0, 0, 1, ${raidus} ${borderWidth}L${width - raidus} ${borderWidth}`
    const Q2 = `A${raidus - borderWidth} ${raidus - borderWidth} 0, 0, 1, ${width - borderWidth} ${raidus}L${width - borderWidth} ${height - raidus}`
    const Q3 = `A${raidus - borderWidth} ${raidus - borderWidth} 0, 0, 1, ${width - raidus} ${height - borderWidth}L${raidus} ${height - borderWidth} `
    const Q4 = `A${raidus - borderWidth} ${raidus - borderWidth} 0, 0, 1, ${borderWidth} ${height - raidus}L${borderWidth} ${raidus}`
    const holePath = `M ${borderWidth} ${raidus} ${Q1} ${Q2} ${Q3} ${Q4}`
    const path = `M 0 0 L 0 ${height} L ${width} ${height} L ${width} 0 L 0 0 ${holePath} Z`
    clipPath = `path('${path}')`
    const borderBgSize = width * 2
    const tranX = (pecent: number) => _.round((pecent * width + borderBgSize * 50 - width * 50) / borderBgSize, 2)
    const tranY = (pecent: number) => _.round((pecent * height + borderBgSize * 50 - height * 50) / borderBgSize, 2)
    const tranP = (pecent: number) => _.round(pecent / 2, 2)
    const tranYC = (pecent: number) => _.round(pecent / (width / height), 2)
    borderBg = `radial-gradient(122.5% ${tranYC(122.5)}% at ${tranX(52.9)}% ${tranY(16.25)}%, #15d264 0%, #2cbd35 ${tranP(36.26)}%, #dcf45d ${tranP(92.54)}%)`
  }
  useEffect(() => {
    const onResize = () => {
      setSize(`${btnRef.current?.clientWidth || 0}_${btnRef.current?.clientWidth || 0}`)
    }
    const r = new ResizeObserver(onResize)
    if (btnRef.current) {
      r.observe(btnRef.current)
    }
    return () => {
      btnRef.current && r.unobserve(btnRef.current)
    }
  }, [btnRef.current])
  return (
    <button
      {...props}
      ref={btnRef}
      style={{ background: 'radial-gradient(76.25% 76.25% at 50.3% 23.75%,rgba(27, 205, 89, 0.2) 0%,rgba(179, 232, 84, 0.2) 100%)' }}
      className={cn(
        'group/bbtn relative px-3 cursor-pointer w-full transition-all leading-[2.375] ring-0 text-base text-black dark:text-white font-medium h-10 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed',
        className,
      )}
    >
      {!hiddenBorder && (
        <div
          className='absolute w-full h-full left-0 top-0 flex justify-center items-center rounded-lg overflow-hidden'
          style={{ visibility: btnRef.current ? 'visible' : 'hidden', clipPath }}
        >
          <div className={cn('w-[200%] aspect-square shrink-0', { 'group-hover/bbtn:animate-spin-slow': !p.disabled })} style={{ background: borderBg }} />
        </div>
      )}
      {busy && <Spinner />}
      {(busyShowContent || !busy) && children}
    </button>
  )
}

import { animate, createSpring, stagger } from 'animejs'
import { useEffect, useRef } from 'react'
const staggerdelay = 70
const animduration = 400
export function useInitAnimRoot(classname: string = 'animitem') {
  const root = useRef<HTMLDivElement>(null)
  const id = useRef<number>(0)
  useEffect(() => {
    console.info('useInitAnimRoot::', Boolean(root.current))
    if (!root.current) return () => {}
    let lastTargets: Element[] = []
    const onChange = (data?: MutationRecord[]) => {
      const added = !data || data.find((item) => item.type === 'childList' && item.addedNodes.length)
      // console.info('AnimChange:', added)
      if (added && root.current) {
        const nTargets = root.current.getElementsByClassName(classname)
        const targets: Element[] = []
        for (const element of nTargets) {
          if (!lastTargets.find((item) => element.isSameNode(item))) targets.push(element)
        }
        lastTargets = [...nTargets]
        if (targets.length) {
          const anim = animate(targets, {
            id: 'anim' + id.current,
            opacity: { from: 0, to: 1 },
            translateY: { from: 100, to: 0 },
            scale: { from: 0.8, to: 1 },
            // rotate: { from: 30 },
            // skewX: { from: 30 },
            delay: stagger(staggerdelay),
            ease: createSpring({ stiffness: 70 }),
            duration: stagger(staggerdelay, { start: animduration }),
          })

          anim.onPause = (ja) => {
            ja.targets as Element[]
            lastTargets = lastTargets.filter((item) => !ja.targets.find((el) => el == item))
            // console.info('AnimPause:', ja.id, ja.targets, lastTargets)
            onChange(data) // recheck
          }
          id.current++
        }
      }
    }
    const mo = new MutationObserver(onChange)
    onChange()
    mo.observe(root.current, { subtree: true, childList: true })
    return () => mo.disconnect()
  }, [root.current])
  return root
}

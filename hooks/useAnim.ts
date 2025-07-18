import { animate, createSpring, stagger } from 'animejs'
import { useEffect, useRef } from 'react'
const staggerdelay = 70
const animduration = 400
export function useInitAnimRoot(classname: string = 'animitem') {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    console.info('useInitAnimRoot::', Boolean(root.current))
    if (!root.current) return () => {}
    let lastTargets: Element[] = []
    const onChange = (data?: MutationRecord[]) => {
      const added = !data || data.find((item) => item.type === 'childList' && item.addedNodes.length)
    //   console.info('AnimChange:', added)
      if (added && root.current) {
        const nTargets = root.current.getElementsByClassName(classname)
        const targets: Element[] = []
        for (const element of nTargets) {
          if (!lastTargets.find((item) => element.isEqualNode(item))) targets.push(element)
        }
        lastTargets = [...nTargets]
        if (targets.length) {
          animate(targets, {
            opacity: { from: 0 },
            translateY: { from: 100 },
            scale: { from: 0.8 },
            // rotate: { from: 30 },
            // skewX: { from: 30 },
            delay: stagger(staggerdelay),
            ease: createSpring({ stiffness: 70 }),
            duration: stagger(staggerdelay, { start: animduration }),
          })
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

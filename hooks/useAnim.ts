import { animate, createSpring, stagger } from 'animejs'
import { useEffect, useRef } from 'react'

export function useInitAnimRoot(classname: string = 'animitem') {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!root.current) return () => {}
    let lastTargets: Element[] = []
    const mo = new MutationObserver((data) => {
      const added = data.find((item) => item.type === 'childList' && item.addedNodes.length)
      if (added && root.current) {
        const nTargets = root.current.getElementsByClassName(classname)
        const targets: Element[] = []
        for (const element of nTargets) {
          if (!lastTargets.find((item) => element.isEqualNode(item))) targets.push(element)
        }
        lastTargets = [...nTargets]
        if (targets.length) {
          animate(targets, {
            opacity: { from: 0 }, // Animate from .5 opacity to 1 opacity
            translateY: { from: 100 }, // From 16rem to 0rem
            delay: stagger(100),
            ease: createSpring({ stiffness: 70 }),
            duration: stagger(100, { start: 500 }),
          })
        }
      }
    })
    mo.observe(root.current, { subtree: true, childList: true })
    // Properly cleanup all anime.js instances declared inside the scope
    return () => mo.disconnect()
  }, [])
  return root
}

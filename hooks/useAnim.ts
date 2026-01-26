import gsap from 'gsap'
import { useEffect, useRef } from 'react'
export function useInitAnimRoot(classname: string = 'animitem') {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!root.current) root.current = document.body as any
    if (!root.current) return () => { }
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
          gsap.fromTo(
            targets,
            {
              y: 100,
              scale: 0.8,
              opacity: 0,
            },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              stagger: 0.07,
              duration: 0.5,
              ease: 'back.out(1.4)',
              lazy: true,
            },
          )
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

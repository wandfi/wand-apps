import { useEffect, useRef } from "react";
import { animate, createScope, Scope } from 'animejs'

export function useRootAnim() {
    const root = useRef<HTMLDivElement>(null)
    const scope = useRef<Scope>()
    useEffect(() => {
        scope.current = createScope({ root }).add((self) => {
            // self
            animate(".anim_item", {
                
            })
        })
    }, [])
    return root
}
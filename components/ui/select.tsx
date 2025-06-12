import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useClickAway } from "react-use";

export type OptionBase = string | {
    key: string
    show: ReactNode,
}
export function SimpleSelect<T extends OptionBase>({ options, value, defValue, onChange, className, itemClassName, currentClassName }: {
    options: T[],
    value?: T,
    onChange?: (data: T) => void,
    className?: string
    itemClassName?: string
    currentClassName?: string
    defValue?: T
}) {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defValue || options[0]);
    useEffect(() => {
        if (options.length && (!selectedValue || !options.find(item => item !== selectedValue))) {
            setSelectedValue(defValue || options[0])
            onChange?.(defValue || options[0])
        }
    }, [options, defValue, selectedValue])
    const current = value || selectedValue
    const ref = useRef<HTMLDivElement>(null)
    useClickAway(ref, () => setIsOpen(false))
    const renderItem = (item: T) => {
        if (!item) return null
        if (typeof item == 'string') return item
        return item.show
    }
    if (options.length == 0) return null
    return <div ref={ref} className={cn("w-auto rounded relative border-gray-400/60 border dark:bg-white/5 bg-white select-none cursor-pointer", className)}>
        <div className={cn("flex items-center justify-between gap-5 px-2 py-1", currentClassName)} onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center">
                {renderItem(current)}
            </div>
            {isOpen ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        {isOpen && (
            <div className="mt-1 absolute overflow-hidden z-50 top-full w-full right-0 flex flex-col rounded bg-white dark:bg-black border-gray-400/60 border">
                {options.map(item => (
                    <div
                        key={typeof item === 'string' ? item : item.key}
                        className={cn("w-auto cursor-pointer px-2 py-1 hover:bg-primary/30", itemClassName)}
                        onClick={() => {
                            setSelectedValue(item)
                            onChange?.(item)
                            setIsOpen(false)
                        }}
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        )}
    </div>
}
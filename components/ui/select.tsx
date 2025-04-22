import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useClickAway } from "react-use";

export function SimpleSelect({ options, value, defValue, onChange, className, itemClassName }: {
    options: string[],
    value?: string,
    onChange?: (data: string) => void,
    className?: string
    itemClassName?: string
    defValue?: string
}) {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defValue || options[0]);
    const current = value || selectedValue

    const ref = useRef<HTMLDivElement>(null)
    useClickAway(ref, () => setIsOpen(false))
    if (options.length == 0) return null
    // return <Select value={value} defaultValue={options[0]} onValueChange={onChange} className={cn("w-auto rounded-lg", className)} enableClear={false}>
    //     {options.map(item => <SelectItem key={item} className={cn("w-auto rounded-lg cursor-pointer", itemClassName)} value={item} >{item}</SelectItem>)}
    // </Select>

    return <div ref={ref} className={cn("w-auto rounded relative border-gray-400/60 border dark:bg-white/5 bg-white select-none", className)}>
        <div className="flex items-center justify-between gap-5 cursor-pointer px-2 py-1" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center">
                <span>{current}</span>
            </div>
            {isOpen ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        {isOpen && (
            <div className="mt-1 absolute overflow-hidden z-50 top-full w-full right-0 flex flex-col rounded bg-white dark:bg-black border-gray-400/60 border">
                {options.map(item => (
                    <div
                        key={item}
                        className={cn("w-auto cursor-pointer px-2 py-1 hover:bg-primary/30", itemClassName)}
                        onClick={() => {
                            setSelectedValue(item)
                            onChange?.(item)
                            setIsOpen(false)
                        }}
                    >
                        {item}
                    </div>
                ))}
            </div>
        )}
    </div>
}
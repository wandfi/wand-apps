'use client'

import { getLogsBy } from "@/lib/logs"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

export default function Logs() {
    const { address } = useAccount()
    const [infos, setInfos] = useState('')
    useEffect(() => {
        if (address) {
            setInfos(JSON.stringify(getLogsBy(address), undefined, 2))
        }
        return () => { }
    })
    return <div className="w-full h-full overflow-auto p-5 card bg-white rounded-xl text-base">
        {infos}
    </div>
}


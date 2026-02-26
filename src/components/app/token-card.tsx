import React, { useMemo } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { TokenMetadata } from "@/lib/wallet"

const chartConfig = {
    amount: {
        label: "Supply",
        color: "var(--primary)",
    }
} satisfies ChartConfig

type Props = {
    tokenMetadata: TokenMetadata,
    issuanceStats: IssuanceStats[]
    network: string
}


export type IssuanceStats = {
    date: Date
    amount: number,
    type: 'mint' | 'burn' | 'transfer'
    transfers: number
    tx: string
}

export const TokenCard: React.FC<Props> = ({ issuanceStats }) => {

    const chartData = useMemo(() => {
        return issuanceStats.map(s => {
            return { date: s.date.toISOString().split('T')[0], amount: s.amount }
        })
    }, [issuanceStats])

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-2 text-sm">
                {/* <p>Name: {tokenMetadata.name}</p>
                <p>Unit: {tokenMetadata.symbol}</p> */}

                {/* <p className="mt-5 font-semibold">Supply LifeCycle</p> */}
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey='amount'
                            type="basis"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity="0.2"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                            dot={false}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
        </div>
    )
}
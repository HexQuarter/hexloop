"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useMemo } from "react"
export const description = "An interactive area chart"

type ChartData = {
    date: string,
    amount: number
}

const chartConfig = {
    amount: {
        label: "Amount"
    },
} satisfies ChartConfig

export const RevenueChart: React.FC<{ chartData: ChartData[] }> = ({ chartData }) => {

    const filteredData = useMemo(() => {
        return chartData.filter((item) => {
            const date = new Date(item.date)
            let daysToSubtract = 90
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - daysToSubtract)
            return date >= startDate
        })
    }, [chartData])

    return (
        <div>
            <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[150px] w-full"
            >
                <AreaChart data={filteredData}>
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
                        dataKey="amount"
                        type="natural"
                        fill="var(--primary)"
                        fillOpacity="0.2"
                        stroke="var(--primary)"
                        strokeWidth="1"
                        strokeOpacity="0.4"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    )
}

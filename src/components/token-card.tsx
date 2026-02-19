import React from "react"
import { Button } from "./ui/button"
import { ExternalLink } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart"
import { Area, AreaChart } from "recharts"
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

export const TokenCard: React.FC<Props> = ({ tokenMetadata, issuanceStats, network }) => {
    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-2 text-sm">
                <p>Name: {tokenMetadata.name}</p>
                <p>Unit: {tokenMetadata.symbol}</p>

                <p className="mt-5 font-semibold">Supply LifeCycle</p>
                <ChartContainer config={chartConfig} className="aspect-auto h-20">
                    <AreaChart data={issuanceStats}>
                        <Area
                            dataKey="amount"
                            type="natural"
                            fill="var(--color-amount)"
                            fillOpacity={0.4}
                            stroke="var(--color-amount)"
                            stackId="a"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                </ChartContainer>
            </div>
            <div>
                <div>
                    <Button
                        className="w-full xl:w-auto"
                        variant="link" onClick={() => window.open(`https://sparkscan.io/token/${tokenMetadata.identifier}?network=${network}`, '_blank')}>
                        <ExternalLink />
                        View more details on explorer
                    </Button>
                </div>
            </div>
        </div>
    )
}
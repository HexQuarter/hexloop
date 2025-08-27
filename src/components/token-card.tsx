import React from "react"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
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
        <Card className="flex flex-col border-primary/20 rounded-sm lg:w-150">
            <CardHeader className="flex flex-col">
                <CardTitle className="flex 2xl:flex-row flex-col justify-between w-full gap-5">
                    <p className="text-2xl text-slate-700">Receipt Program </p>
                </CardTitle>
                <CardDescription>Represents paid work that can be redeemed for future discounts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
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
            </CardContent>
            <CardFooter>
                <CardAction>
                    <Button
                        className="w-full xl:w-auto"
                        variant="link" onClick={() => window.open(`https://sparkscan.io/token/${tokenMetadata.identifier}?network=${network}`, '_blank')}>
                        <ExternalLink />
                        View more details on explorer
                    </Button>
                </CardAction>
            </CardFooter>
        </Card>
    )
}
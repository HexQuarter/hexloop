import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receive } from "./receive"
import { Send, type Asset } from "./send"
import type { Addresses } from "@/hooks/use-wallet"
import type { SparkPayment, TokenMetadata, Wallet } from "@/lib/wallet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { HistoryTransaction } from "./history-transaction"

type Token = {
    id: string
    name: string
    symbol: string
    amount: number
}

type Props = {
    addresses: Addresses
    btcBalance: number
    tokens: Token[]
    tokenMetadata?: TokenMetadata,
    price: number
    currency: string
    onSend: (method: 'spark' | 'lightning' | 'bitcoin', asset: Asset, amount: number, recipient: string) => Promise<void>
    payments: ExtendedPayment[]
    wallet: Wallet
}

type ExtendedPayment = SparkPayment & {
    url?: string
}

export const WalletCard: React.FC<Props> = ({ btcBalance, tokens, tokenMetadata, addresses, price, currency, onSend, payments, wallet }) => {
    const assets: Asset[] = [
        { name: "Bitcoin", symbol: "BTC", max: btcBalance },
        ...tokens.map((t) => {
            return {
                name: t.name,
                max: t.amount,
                symbol: t.symbol,
                identifier: t.id
            } as Asset
        })
    ]

    const currencyFormat = new Intl.NumberFormat(navigator.language || "en-US", { style: 'currency', currency: currency });

    return (
        <Card className="flex flex-col gap-10 border-primary/20 rounded-sm lg:w-1/4">
            <CardHeader className="flex flex-col gap-5 ">
                <CardTitle className="text-2xl text-slate-700">Wallet</CardTitle>
                <CardDescription>
                    <div className="border-primary/40 flex text-slate-700 flex-col">
                        <span className="text-2xl">{currencyFormat.format(btcBalance * price)}</span>
                        <span className="text-xs">{btcBalance} BTC</span>
                    </div>
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
                <div className="flex gap-2">
                    <CardAction><Send assets={assets} price={price} onSend={onSend} wallet={wallet} /></CardAction>
                    <CardAction>
                        <Receive addresses={addresses} />
                    </CardAction>
                </div>
                <Tabs defaultValue="assets" className="flex flex-col gap-10">
                    <TabsList className="bg-transparent p-0">
                        <TabsTrigger value={"assets"} className="p-5 data-[state=active]:text-primary data-[state=active]:border-1 data-[state=active]:border-b-primary/80 text-gray-400 rounded-none data-[state=active]:shadow-none">Assets</TabsTrigger>
                        <TabsTrigger value={"history"} className="p-5 data-[state=active]:text-primary data-[state=active]:border-1 data-[state=active]:border-b-primary/20 text-gray-400 rounded-none data-[state=active]:shadow-none">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assets">
                        <div className="flex flex-col gap-1">
                            {tokens.map((t) => (
                                <div key={t.id} className="flex gap-1 justify-between rounded-sm p-3 bg-gray-50 border-gray-100 border-1 hover:bg-primary/10 hover:border-primary/20">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold ">{t.symbol}</span>
                                        <span className="text-xs flex gap-2 items-center">
                                            {t.name}
                                            {tokenMetadata && tokenMetadata.identifier == t.id &&
                                                <Badge className="bg-primary/10 border-primary/20 text-primary">Issuer</Badge>
                                            }
                                        </span>
                                    </div>
                                    <span className="font-semibold">{t.amount}</span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="history">
                        <div className="flex flex-col gap-2">
                            {payments.map((p) => (
                                <HistoryTransaction payment={p} price={price} key={p.id} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
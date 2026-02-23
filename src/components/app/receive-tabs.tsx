import { shortenAddress } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QRCode from "react-qr-code"
import { Copy } from "lucide-react"
import { toast } from "sonner"

export type TabType = 'btc' | 'spark' | 'lightning'

type Props = {
    btcAddress: string
    sparkAddress: string
    lnAddress: string
    onTabChange?: (val: TabType, address: string) => void
    amount?: number
}

export const TabsReceive: React.FC<Props> = ({ btcAddress, sparkAddress, lnAddress, onTabChange, amount }) => {
    const copy = (address: string) => {
        navigator.clipboard.writeText(address)
        const toastId = toast.info('Address copied into the clipboard')
        setTimeout(() => {
            toast.dismiss(toastId)
        }, 2000)
    }

    const handleTabChange = (e: string) => {
        if (onTabChange) {
            switch (e) {
                case 'btc':
                    onTabChange('btc', btcAddress)
                    break
                case 'lightning':
                    onTabChange('lightning', lnAddress)
                    break
                case 'spark':
                    onTabChange('spark', sparkAddress)
                    break
                default:
                    throw new Error('Unsupported payment type')
            }
        }
    }

    return (
        <Card>
            <Tabs defaultValue="spark" onValueChange={handleTabChange} className="flex flex-col gap-10">
                <TabsList className="bg-transparent p-0 border-border/40 border-b-1 w-full rounded-none">
                    <TabsTrigger value={"spark"} className="font-mono uppercase text-xs p-5 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent data-[state=active]:text-primary text-gray-300">Spark</TabsTrigger>
                    <TabsTrigger value={"lightning"} className="font-mono uppercase text-xs p-5 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent data-[state=active]:text-primary text-gray-300">Lightning</TabsTrigger>
                    <TabsTrigger value={"btc"} className="font-mono uppercase text-xs p-5 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent data-[state=active]:text-primary text-gray-300">Bitcoin</TabsTrigger>
                </TabsList>
                <TabsContent value="spark" className="flex flex-col gap-2">
                    <h2 className="font-semibold text-xl">Deposit via Spark</h2>
                    <p className="text-muted-foreground text-sm">Instant, near-zero-cost transfers between Spark users with complete privacy.</p>
                    <div className="flex flex-col gap-5 w-full">
                        <div className="bg-white lg:p-10 rounded w-full justify-center flex"><QRCode value={sparkAddress} /></div>
                        <div className="flex flex-col">
                            <p className="text-foreground font-semibold">Deposit {amount && `${amount} BTC to this`} address </p>
                            <p className="text-primary flex justify-between">
                                {shortenAddress(sparkAddress)}
                                <Copy onClick={() => copy(sparkAddress)} />
                            </p>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="lightning" className="flex flex-col gap-2">
                    <h2 className="font-semibold text-xl">Deposit via Lightning</h2>
                    <p className="text-muted-foreground text-sm">Fast global payments, reaching any Lightning wallet worldwide.</p>
                    <div className="flex flex-col gap-5 w-full">
                        <div className="bg-white lg:p-10 rounded w-full justify-center flex"><QRCode value={lnAddress} /></div>
                        <div className="flex flex-col">
                            <p className="text-foreground font-semibold">Deposit {amount && `${amount} BTC to this`} address </p>
                            <p className="text-primary flex justify-between">
                                {shortenAddress(lnAddress)}
                                <Copy onClick={() => copy(lnAddress)} />
                            </p>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="btc" className="flex flex-col gap-2">
                    <h2 className="font-semibold text-xl">Deposit via Bitcoin</h2>
                    <p className="text-muted-foreground text-sm">Secure on-chain settlement with maximum security and global accessibility.</p>
                    <div className="flex flex-col gap-5 w-full">
                        <div className="bg-white lg:p-10 rounded w-full justify-center flex"><QRCode value={btcAddress} /></div>
                        <div className="flex flex-col">
                            <p className="text-foreground font-semibold">Deposit {amount && `${amount} BTC to this`} address </p>
                            <p className="text-primary flex justify-between">
                                {shortenAddress(btcAddress)}
                                <Copy onClick={() => copy(btcAddress)} />
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
    )
}
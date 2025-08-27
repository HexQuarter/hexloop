import { shortenAddress } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
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
        <Tabs defaultValue="spark" onValueChange={handleTabChange}>
            <TabsList className="bg-transparent p-0 pb-3">
                <TabsTrigger value={"spark"} className="p-5 data-[state=active]:bg-primary/10! data-[state=active]:text-primary data-[state=active]:border-1 data-[state=active]:border-primary/20 rounded-full text-gray-400">Spark</TabsTrigger>
                <TabsTrigger value={"lightning"} className="p-5 data-[state=active]:bg-primary/10! data-[state=active]:text-primary data-[state=active]:border-1 data-[state=active]:border-primary/20 rounded-full text-gray-400">Lightning</TabsTrigger>
                <TabsTrigger value={"btc"} className="p-5 data-[state=active]:bg-primary/10! data-[state=active]:text-primary data-[state=active]:border-1 data-[state=active]:border-primary/20 rounded-full text-gray-400">Bitcoin</TabsTrigger>
            </TabsList>
            <TabsContent value="spark">
                <Card className=" w-full">
                    <CardHeader>
                        <CardTitle>Deposit via Spark</CardTitle>
                        <CardDescription>Instant, near-zero-cost transfers between Spark users with complete privacy.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="bg-white lg:p-10 rounded w-full justify-center flex"><QRCode value={sparkAddress} /></div>
                            <div className="flex flex-col">
                                <p className="">Deposit {amount && `${amount} BTC to this`} address </p>
                                <p className="text-primary flex justify-between">
                                    {shortenAddress(sparkAddress)}
                                    <Copy onClick={() => copy(sparkAddress)} />
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="lightning">
                <Card className=" w-full">
                    <CardHeader>
                        <CardTitle>Deposit via Lightning</CardTitle>
                        <CardDescription>Fast global payments, reaching any Lightning wallet worldwide.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="bg-white lg:p-10 rounded w-full justify-center flex"><QRCode value={lnAddress} /></div>
                            <div className="flex flex-col">
                                <p className="">Deposit {amount && `${amount} BTC to this`} address </p>
                                <p className="text-primary flex justify-between">
                                    {shortenAddress(lnAddress)}
                                    <Copy onClick={() => copy(lnAddress)} />
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="btc">
                <Card className=" w-full">
                    <CardHeader>
                        <CardTitle>Deposit via Bitcoin</CardTitle>
                        <CardDescription>Secure on-chain settlement with maximum security and global accessibility.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="bg-white lg:p-10 rounded w-full justify-center flex"><QRCode value={btcAddress} /></div>
                            <div className="flex flex-col">
                                <p className="">Deposit {amount && `${amount} BTC to this`} address </p>
                                <p className="text-primary flex justify-between">
                                    {shortenAddress(btcAddress)}
                                    <Copy onClick={() => copy(btcAddress)} />
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
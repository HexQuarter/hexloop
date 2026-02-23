import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, Coins } from "lucide-react"
import type React from "react"
import { useState, type FormEvent } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const USD_FEE = 1


const included = [
    "Payment page generation",
    "Multi payment support: Spark, Lightning, Bitcoin",
    "Client redemption flow",
    "No custody of funds"
]

export type PaymentRequestData = {
    description?: string
    amount: number
    feeBTC: number
    discountRate: number
}

type Props = {
    onSubmit: (data: PaymentRequestData) => Promise<void>
    price: number
}

export const PaymentRequestForm: React.FC<Props> = ({ onSubmit, price }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [amount, setAmount] = useState(0)
    const [description, setDescription] = useState("")
    const [ready, setReady] = useState(false)
    const [discountRate, setDiscountRate] = useState(10)

    const feeBTC = usdToBtc(USD_FEE, price);

    const handleChangeAmount = (val: string) => {
        const amount = parseFloat(val)
        if (Number.isNaN(amount)) {
            setAmount(0)
            setReady(false)
            return
        }
        setReady(amount > 0)
        setAmount(amount)
    }

    const handleDiscountChange = (val: string) => {
        const amount = parseInt(val)
        if (Number.isNaN(amount)) {
            setDiscountRate(10)
            return
        }
        setDiscountRate(amount)
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setLoading(true)
            await onSubmit({
                amount,
                description,
                feeBTC,
                discountRate
            })
            setLoading(false)
            setOpen(false)
        }
        catch (e) {
            setLoading(false)
        }
    }

    function usdToBtc(usd: number, btcPriceUsd: number) {
        // btcPriceUsd = USD per 1 BTC
        return Math.floor(usd * 100_000_000 / btcPriceUsd) / 100_000_000;
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setAmount(0)
            setDescription("")
            setReady(false)
        }
        setOpen(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild onClick={() => setOpen(true)} >
                <Button className="w-full">New payment request</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-hidden bg-slate-50 overflow-y-auto">
                <DialogHeader className="">
                    <DialogTitle className="text-2xl pb-2 flex items-center gap-2 font-serif font-light"><Coins className="text-primary" />Create payment request</DialogTitle>
                    <DialogDescription className="flex flex-col gap-2">
                        Request a Bitcoin payment for completed work.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="flex flex-col gap-4 my-4">
                        <Card className="bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-black">Amount</CardTitle>
                                <CardDescription className=" text-muted-foreground">Enter the amount in USD for the payment request.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input required id="amount" type='number' min='0' placeholder='0' onChange={(e) => handleChangeAmount(e.target.value)} value={amount} />
                            </CardContent>
                            <CardFooter className="flex flex-col gap-5 items-start">
                                <p className="text-xs text-gray-400">A BTC payment equivalent of {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} will be present and refreshed on the checkout page matching the most recent rate.</p>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-black">Description (optional)</CardTitle>
                                <CardDescription className="">What is this payment for ?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Textarea id="description" onChange={(e) => setDescription(e.target.value)} placeholder="Frontend delivery for Project Alpha" value={description} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-black">Discount percentage</CardTitle>
                                <CardDescription className="">What is the maximum discount (%) a customer can receive by redeeming tokens?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Input type="number" min="0" max="100" step="5" value={discountRate} onChange={(e) => handleDiscountChange(e.target.value)} />
                                <p className="text-xs text-gray-400">For exemple with a $1000 request, customer could have a max discount of ${1000 - (1000 * (1 - discountRate / 100))}</p>
                            </CardContent>
                        </Card>
                        { ready && <DialogFooter>
                            <Card className={`overflow-hidden rounded-2xl border border-border/40 bg-background transition-all duration-1000 delay-200 w-full`}>
                                <CardHeader className="border-b border-border/40 flex flex-col gap-4">
                                    <p className="font-medium font-mono text-primary uppercase text-xs">Before you proceed</p>
                                    <p className="text-normal font-muted-foreground text-sm">Activating this payment request costs <br /><strong>{(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(USD_FEE))} ({feeBTC} BTC)</strong>. </p>
                                    <p className="text-normal font-muted-foreground text-sm">This one-time fee includes:</p>
                                </CardHeader>
                                <CardContent className="flex flex-col">
                                    {included.map((item, i) => (
                                        <div
                                            key={item}
                                            className={`flex items-center gap-4 py-4 ${i < included.length - 1 ? "border-b border-border/20" : ""}`}
                                        >
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <span className="text-sm text-foreground/80">{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="py-8 flex flex-col gap-2">
                                    <Button className="w-full" disabled={loading}>
                                        Create payment request
                                        {loading && <Spinner />}{!loading && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </DialogFooter>}
                        <DialogClose asChild><Button variant="outline" className="w-full bg-white">Cancel</Button></DialogClose>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

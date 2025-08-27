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
import { Coins } from "lucide-react"
import type React from "react"
import { useState, type FormEvent } from "react"
import { Spinner } from "./ui/spinner"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

const USD_FEE = 1

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
        catch(e) {
            setLoading(false)
        }
    }

    function usdToBtc(usd: number, btcPriceUsd: number) {
        // btcPriceUsd = USD per 1 BTC
        return Math.floor(usd * 100_000_000 / btcPriceUsd) / 100_000_000;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)} >
                <Button className="w-full">New payment request</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden bg-gray-50 overflow-y-auto">
                <DialogHeader className="">
                    <DialogTitle className="text-slate-800 text-2xl pb-2 flex items-center gap-2"><Coins className="text-primary" />Create Payment Request</DialogTitle>
                    <DialogDescription className="flex flex-col gap-2">
                        Request a Bitcoin payment for completed work.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="flex flex-col gap-4 my-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-semibold text-black">Amount</CardTitle>
                                <CardDescription className="text-xs">Enter the amount in USD for the payment request.</CardDescription>
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
                                <CardTitle className="font-semibold text-black">Description (optional)</CardTitle>
                                <CardDescription className="text-xs">What is this payment for ?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Textarea id="description" onChange={(e) => setDescription(e.target.value)} placeholder="Frontend delivery for Project Alpha" value={description} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-semibold text-black">Discount percentage</CardTitle>
                                <CardDescription className="text-xs">What is the maximum discount (%) a customer can receive by redeeming tokens?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Input type="number" min="0" max="100" step="5" value={discountRate} onChange={(e) => handleDiscountChange(e.target.value)} />
                                <p className="text-xs text-gray-500">For exemple with a $1000 request, customer could have a max discount of ${1000 - (1000 * (1 - discountRate / 100))}</p>
                            </CardContent>
                        </Card>
                        <p className="text-xs text-gray-500">Activating this payment request costs <strong>{(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(USD_FEE))} ({feeBTC} BTC)</strong>. </p>
                        <p className="text-xs text-gray-500">This unlocks a public checkout page and allows customers to redeem their tokens for discounts.</p>
                        <p className="text-xs text-gray-500 italic">One-time fee. No subscription required.</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={!ready || loading}> {loading && <Spinner />} Unlock and create payment request</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

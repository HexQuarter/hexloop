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
import { Label } from "@/components/ui/label"
import { MinusCircle } from "lucide-react"
import type React from "react"
import { useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Spinner } from "./ui/spinner"

export type BurnSubmitData = {
    amount: number
}

type Props = {
    onSubmit: (data: BurnSubmitData) => Promise<void>
}

export const BurnTokenForm: React.FC<Props> = ({ onSubmit }) => {
    const [amount, setAmount] = useState(0)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await onSubmit({ amount })
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                <Button variant='outline' className="w-full xl:w-auto bg-gray-50 border-1 border-gray-100 hover:bg-primary/10 hover:border-primary/20"><MinusCircle />Burn</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-50">
                <DialogHeader>
                    <DialogTitle>Token burning</DialogTitle>
                    <DialogDescription>
                        Remove loyalty tokens from circulation for corrections, reversals, or administrative adjustments.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle><Label htmlFor="amount">Amount to burn</Label></CardTitle>
                            <CardDescription>Specify the number of tokens to permanently remove from the circulating supply</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 my-4">
                                <div className="grid gap-3">
                                    <Input required id="amount" type='number' min='0' placeholder='1' onChange={(e) => setAmount(parseFloat(e.target.value))} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="bg-gray-100 border-0 hover:bg-gray-300">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} > {loading && <Spinner />} Burn the tokens</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

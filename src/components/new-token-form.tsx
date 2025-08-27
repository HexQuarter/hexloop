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
import { Coins } from "lucide-react"
import type React from "react"
import { useState, type FormEvent } from "react"
import { Spinner } from "./ui/spinner"

type SubmitData = {
    symbol: string,
    name: string
}

type Props = {
    onSubmit: (data: SubmitData) => Promise<void>
}

export const NewTokenForm: React.FC<Props> = ({ onSubmit }) => {
    const [name, setName] = useState("")
    const [symbol, setSymbol] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // TODO: Short and Memorable: Keep tickers to 3-5 characters
        // TODO: Uppercase: Use all uppercase letters

        await onSubmit({ name, symbol })
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)} >
                <Button>Create token</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] hb">
                <DialogHeader className="">
                    <DialogTitle className="text-slate-800 text-2xl pb-2 flex items-center gap-2"><Coins className="text-primary"/>Token issuance</DialogTitle>
                    <DialogDescription>
                        Send tokens to another wallet address
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="flex flex-col gap-4 my-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name" className="text-primary text-md text-slate-500">Token name</Label>
                            <Input id="name" onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="symbol" className="text-primary text-md text-slate-500">Token ticker</Label>
                            <Input id="symbol" onChange={(e) => setSymbol(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} > { loading && <Spinner />} Create the token</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
// import { Input } from "./ui/input"
import { Spinner } from "./ui/spinner"
import { Textarea } from "./ui/textarea"
import { Coins } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { Payment } from "./payment-table"

export type ReceiptMetadataData = {
    transactionId: string,
    description?: string
    recipientName?: string
    recipientAddress?: string
    paymentId?: string
}

type Props = {
    paymentRequests: Payment[]
    metadata: ReceiptMetadataData,
    onSubmit: (data: ReceiptMetadataData) => Promise<void>
    onClose: () => void
}

export const ReceiptMetadataForm: React.FC<Props> = ({ metadata, onSubmit, onClose, paymentRequests }) => {
    const [open, setOpen] = useState(true)
    const [loading, setLoading] = useState(false)

    const [description, setDescription] = useState(metadata.description || '')
    const [recipientName, _setRecipientName] = useState(metadata.recipientName || '')
    const [recipientAddress, _setRecipientAddress] = useState(metadata.recipientAddress || '')
    const [paymentId, setPaymentId] = useState(metadata.paymentId || undefined)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        let newMetadata = metadata
        newMetadata.description = description
        newMetadata.recipientAddress = recipientAddress
        newMetadata.recipientName = recipientName
        newMetadata.paymentId = paymentId
        await onSubmit(newMetadata)
        setLoading(false)
        setOpen(false)
    }

    useEffect(() => {
        if (!open) onClose()
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-gray-50">
                <DialogHeader className="">
                    <DialogTitle className="text-slate-800 text-2xl pb-2 flex items-center gap-2"><Coins className="text-primary" />Update Receipt Metadata</DialogTitle>
                    <DialogDescription className="flex flex-col gap-2">
                        You can define metadata related to minted receipts. This would help you for audit and history.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="flex flex-col gap-4 my-4">
                        <Card className="grid gap-3">
                            <CardHeader>
                                <CardTitle className="font-semibold text-black">Project Description</CardTitle>
                                <CardDescription className="text-xs">Describe the work that was completed. This creates a clear, auditable record tied to the issued receipt.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Textarea id="description" onChange={(e) => setDescription(e.target.value)} placeholder="Frontend delivery for Project Alpha" value={description} />
                            </CardContent>
                        </Card>
                        {/* <Card className="grid gap-3">
                            <CardHeader>
                                <CardTitle className="font-semibold text-black">Recipient</CardTitle>
                                <CardDescription className="text-xs">Who did receive this receipt?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Input id="client" type="text" placeholder="Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                                <Input id="address" type="text" placeholder="Spark Wallet address" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                            </CardContent>
                        </Card> */}
                        <Card className="grid gap-3">
                            <CardHeader>
                                <CardTitle className="font-semibold text-black">Payment</CardTitle>
                                <CardDescription className="text-xs">Is it associated to a payment ?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Select onValueChange={setPaymentId} value={paymentId}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select a payment request" /></SelectTrigger>
                                    <SelectContent>
                                        {paymentRequests.map((p, i) => (
                                            <SelectItem key={i} value={p.id}>{new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' }).format(p.amount)} on {p.created_at.toLocaleDateString()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} > {loading && <Spinner />} Update receipt metadata</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
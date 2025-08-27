import { type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "./ui/data-table"
import React, { useState } from "react"
import { CircleMinus, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { shortenAddress } from "@/lib/utils"
import { Spinner } from "./ui/spinner"
import { IssueReceiptForm, type IssueReceiptData } from "./issue-receipt"
import type { Receipt } from "./receipt-table"

export type Payment = {
    created_at: Date
    amount: number
    description?: string
    settle_tx?: string,
    discount_rate: number,
    redeem_amount?: number,
    redeem_tx?: string,
    id: string
    claimable: number
    nonce: number
    settlement_mode?: string
}

const getColumns = (onRemove: (id: string) => void, onClaim: (id: string) => Promise<void>, onDeriveReceipt: (data: IssueReceiptData) => Promise<void>, paymentRequests: Payment[], receipts: Receipt[]) => {
    return [
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => {
                const date: Date = row.getValue("created_at")
                return date.toLocaleString()
            }
        },
        {
            accessorKey: "amount",
            header: "Amount"
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description: string | null = row.getValue("description")
                return description ? description : "N/A"
            }
        },
        {
            accessorKey: "discount_rate",
            header: "Discount rate",
            cell: ({ row }) => {
                const discount_rate: number = row.getValue("discount_rate")
                return `${discount_rate}%`
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const settle_tx: string | null = row.getValue("settle_tx")
                if (settle_tx) {
                    return <span className="text-green-600 bg-green-600/20 pl-2 pr-2 pt-1 pb-1 rounded">Settled</span>
                }
                return <span className="text-yellow-500 bg-yellow-500/20 pl-2 pr-2 pt-1 pb-1 rounded">Pending</span>
            }
        },
        {
            accessorKey: "redeem_amount",
            header: "Redeemed amount",
            cell: ({ row }) => {
                const redeeemAmount: number | null = row.getValue("redeem_amount")
                if (redeeemAmount) {
                    const redeemTx = row.original.redeem_tx
                    return (
                        <div>
                            <span>{redeeemAmount}</span>
                            <Button variant="link" size="sm" popoverTarget="" onClick={() => window.open(`https://sparkscan.io/tx/${redeemTx}`, '_blank')}>See transaction<ExternalLink /></Button>
                        </div>
                    )
                }
                return "N/A"
            }
        },
        {
            accessorKey: "settle_tx",
            header: "Settlement transaction",
            cell: ({ row }) => {
                const settle_tx: string | null = row.getValue("settle_tx")
                if (settle_tx) {
                    let url = ''
                    switch(row.original.settlement_mode) {
                        case "spark":
                            url = `https://sparkscan.io/tx/${settle_tx}`
                            break
                        case "btc":
                            url = `https://www.blockchain.com/explorer/transactions/btc/${settle_tx}`
                            break
                        default:
                            return <></>
                    }

                    return (
                        <div className="flex items-center gap-2">
                            {shortenAddress(settle_tx)}
                            <Button variant="link" size="sm" popoverTarget="" onClick={() => window.open(url, '_blank')}><ExternalLink /></Button>
                        </div>
                    )
                }
                return "N/A"
            }
        },
        {
            accessorKey: "actions",
            header: "",
            cell: ({ row }) => {
                const [claimLoading, setClaimLoading] = useState(false)

                const handleClaim = async () => {
                    try {
                        setClaimLoading(true)
                        await onClaim(row.original.id)
                    }
                    catch (e) { setClaimLoading(false) }
                    finally { setClaimLoading(false) }
                }

                const canDeriveReceipts = row.original.settle_tx && !receipts.find(r => r.paymentId == row.original.id)

                return (
                    <div className="flex gap-1">
                        {!row.original.settle_tx && <Button variant="link" size="sm" popoverTarget="" onClick={() => window.open(`#/payment/${row.original.id}`, '_blank')}>Open payment's page <ExternalLink /></Button>}
                        {!row.original.settle_tx && <Button variant="outline" onClick={() => onRemove(row.original.id)}>Remove <CircleMinus /></Button>}
                        {canDeriveReceipts && <IssueReceiptForm buttonVariant='outline' onSubmit={onDeriveReceipt} buttonText="Derive receipt" amount={row.original.amount} description={row.original.description} paymentId={row.original.id} paymentRequests={paymentRequests} />}
                        {row.original.claimable > 0 && <Button onClick={handleClaim}>Claim {row.original.claimable} BTC {claimLoading && <Spinner />}</Button>}
                    </div>
                )
            }
        }
    ] as ColumnDef<Payment>[]
}


type Props = {
    data: Payment[]
    onRemove: (id: string) => Promise<void>
    onClaim: (id: string) => Promise<void>
    onDeriveReceipt: (data: IssueReceiptData) => Promise<void>,
    paymentRequests: Payment[],
    receipts: Receipt[]
}

export const PaymentTable: React.FC<Props> = ({ data, onRemove, onClaim, onDeriveReceipt, paymentRequests, receipts }) => {
    return (
        <div>
            <DataTable columns={getColumns(onRemove, onClaim, onDeriveReceipt, paymentRequests, receipts)} data={data} />
        </div>
    )
}
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/ui/data-table"
import React, { useState } from "react"
import { CircleMinus, ExternalLink, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { IssueReceiptForm, type IssueReceiptData } from "./issue-receipt"
import type { Receipt } from "./receipt-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
            header: "Amount",
            cell: ({ row }) => {
                return (
                    <div className="flex gap-1">
                        <span className={row.original.redeem_tx ? 'line-through' : ''}>
                            {Intl.NumberFormat(navigator.language || "en-US", { style: 'currency', currency: 'USD' }).format(row.original.amount)}
                        </span>
                        {row.original.redeem_amount && <span>
                            {Intl.NumberFormat(navigator.language || "en-US", { style: 'currency', currency: 'USD' }).format(row.original.amount - row.original.redeem_amount)}
                        </span>}
                    </div>
                )
            }
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
                return (
                    <div className="flex gap-2">
                        {row.original.redeem_tx &&
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-white bg-black/70 pl-2 pr-2 pt-1 pb-1 rounded items-center flex">Discounted</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{`${row.original.redeem_amount} tokens have been redeemed.`}</p>
                                </TooltipContent>
                            </Tooltip>
                        }

                        {row.original.settlement_mode &&
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-green-600 bg-green-600/20 pl-2 pr-2 pt-1 pb-1 rounded">Settled</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{`Payment have been settled on ${row.original.settlement_mode.toUpperCase()}.`}</p>
                                </TooltipContent>
                            </Tooltip>
                        }
                        {row.original.settlement_mode && receipts.find(r => r.paymentId == row.original.id) &&
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-slate-600 bg-primary/20 pl-2 pr-2 pt-1 pb-1 rounded items-center flex">Minted</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{`Receipt have been derived for this payment.`}</p>
                                </TooltipContent>
                            </Tooltip>
                        }
                        {!row.original.settlement_mode &&
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-yellow-500 bg-yellow-500/20 pl-2 pr-2 pt-1 pb-1 rounded">Pending</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{`Payment is not yet settled. A settlement transaction is required to finalize this payment.`}</p>
                                </TooltipContent>
                            </Tooltip>}
                    </div >
                )
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
                const derivedReceipt = receipts.find(r => r.paymentId == row.original.id)
                const deriveReceiptTx = derivedReceipt ? `https://sparkscan.io/tx/${derivedReceipt.transaction}` : ''

                const settle_tx: string | undefined = row.original.settle_tx
                let settle_tx_url: string | undefined
                if (settle_tx) {
                    switch (row.original.settlement_mode) {
                        case "spark":
                            settle_tx_url = `https://sparkscan.io/tx/${settle_tx}`
                            break
                        case "btc":
                            settle_tx_url = `https://www.blockchain.com/explorer/transactions/btc/${settle_tx}`
                            break
                        default:
                            return <></>
                    }
                }

                const redeemTx: string | undefined = row.original.redeem_tx
                let redeemTxUrl: string | undefined
                if (redeemTx) {
                    redeemTxUrl = `https://sparkscan.io/tx/${redeemTx}`
                }

                const actionToDo = canDeriveReceipts || row.original.claimable > 0

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex gap-1 items-center">
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                <span className={`relative flex size-2 ${actionToDo ? 'visible' : 'invisible'}`}>
                                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75'></span>
                                    <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                                </span>
                                <span className="sr-only">Open menu</span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!row.original.settle_tx && <DropdownMenuItem onClick={() => window.open(`#/payment/${row.original.id}`, '_blank')}>Open payment's page <ExternalLink /></DropdownMenuItem>}
                            {canDeriveReceipts && <IssueReceiptForm buttonVariant='none' onSubmit={onDeriveReceipt} buttonText="Derive receipt" amount={row.original.amount} description={row.original.description} paymentId={row.original.id} paymentRequests={paymentRequests} />}
                            {row.original.claimable > 0 && <DropdownMenuItem onClick={handleClaim} className="text-primary font-semibold">Claim {row.original.claimable} BTC {claimLoading && <Spinner />}</DropdownMenuItem>}
                            {settle_tx_url && <DropdownMenuItem onClick={() => window.open(settle_tx_url, '_blank')}>Open settlement transaction <ExternalLink /></DropdownMenuItem>}
                            {redeemTxUrl && <DropdownMenuItem onClick={() => window.open(redeemTxUrl, '_blank')}>Open redeem transaction <ExternalLink /></DropdownMenuItem>}
                            {derivedReceipt && <DropdownMenuItem onClick={() => window.open(deriveReceiptTx, '_blank')}>Open receipt mint transaction <ExternalLink /></DropdownMenuItem>}
                            {!row.original.settle_tx && <DropdownMenuItem onClick={() => onRemove(row.original.id)}>Remove <CircleMinus /></DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        },

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
        <DataTable columns={getColumns(onRemove, onClaim, onDeriveReceipt, paymentRequests, receipts)} data={data} />
    )
}
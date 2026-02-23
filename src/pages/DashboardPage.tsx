import { NewTokenForm } from "@/components/app/new-token-form"

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { WalletCard } from "@/components/app/wallet-card"
import { TokenCard, type IssuanceStats } from "@/components/app/token-card"
import { IssueReceiptForm, type IssueReceiptData } from "@/components/app/issue-receipt"
import { PaymentRequestForm, type PaymentRequestData } from "@/components/app/payment-request"
import { ReceiptTable, type Receipt } from "@/components/app/receipt-table"
import { type SparkPayment, type TokenBalanceMap, type TokenMetadata, type TokenTransaction, type Wallet } from "@/lib/wallet"
import { createPaymentRequest, deletePaymentRequest, fetchPaymentRequest, fetchPaymentRequests, fetchReceiptMetadata, patchReceiptMetadata } from "@/lib/api"
import { PaymentTable, type Payment } from "@/components/app/payment-table"
import type { Asset } from "@/components/app/send"
import { send } from "@/lib/utils"
import type { ReceiptMetadataData } from "@/components/app/receipt-metadata-form"
import { Skeleton } from "@/components/ui/skeleton"

export const DashboardPage = () => {
    const { wallet } = useWallet()

    const [initializing, setInitializing] = useState(true)
    const [btcBalance, setBtcBalance] = useState(0n)
    const [tokenBalances, setTokenBalances] = useState<TokenBalanceMap | undefined>(undefined)
    const [issuanceStats, setIssuanceStats] = useState<IssuanceStats[]>([])
    const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | undefined>(undefined)
    const [addresses, setAddresses] = useState<{ btc: string, ln: string, spark: string } | null>(null)
    const [price, setPrice] = useState(0)
    const [paymentRequests, setPaymentRequests] = useState<Payment[]>([])
    const [receipts, setReceipts] = useState<Receipt[]>([])
    const [walletHistory, setWalletHistory] = useState<SparkPayment[]>([])

    const currency = localStorage.getItem('LOP_CURRENCY') || 'USD'

    const updateBalance = async (wallet: Wallet) => {
        const balance = await wallet.getBalance()
        setBtcBalance(balance.balance)

        if (balance.tokenBalances.size > 0) {
            setTokenBalances(balance.tokenBalances)
        }
    }

    const updateStats = async (wallet: Wallet, metadata: TokenMetadata) => {
        let payments: TokenTransaction[] = []
        let offset = 0
        const pageSize = 10
        let hasMore = true

        while (hasMore) {
            const transactions = await wallet.listTokenTransactions(metadata.identifier, offset, pageSize)
            if (transactions.length === 0) {
                hasMore = false
            } else {
                payments = payments.concat(transactions)
                offset += pageSize
            }
        }

        const issuanceStats = payments
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .reduce((acc, tx) => {
                if (tx.type == 'mint') {
                    const amount = Number(tx.amount) / (10 ** metadata.decimals)
                    acc.amount += amount
                    acc.dates.push({ date: tx.date, amount: amount, transfers: 0, type: 'mint', tx: tx.txHash || '' })
                }
                else if (tx.type == 'burn') {
                    const amount = Number(tx.amount) / (10 ** metadata.decimals)
                    acc.amount -= amount
                    acc.dates.push({ date: tx.date, amount: amount, transfers: 0, type: 'burn', tx: tx.txHash || '' })
                }
                else {
                    const amount = Number(tx.amount) / (10 ** metadata.decimals)
                    acc.dates.push({ date: tx.date, amount: amount, transfers: amount, type: 'transfer', tx: tx.txHash || '' })
                }

                return acc

            }, {
                amount: 0, dates: []
            } as { amount: number, dates: any[] })

        const stats = issuanceStats.dates
        setIssuanceStats(stats)
    }

    useEffect(() => {
        if (!wallet) return

        wallet.on('paymentReceived', (payment) => {
            if (payment.method != 'token') {
                toast.success(`Received payment of ${Number(payment.amount) / 100_000_000} BTC`)
            }
        })
        wallet.on('paymentPending', (payment) => {
            if (payment.paymentType == 'receive') {
                toast.info(`Payment incoming. Waiting for confirmation...`)
            }
        })

        const fetchData = async () => {
            const btcAddresses = await wallet.getBitcoinAddress()
            const sparkAddress = await wallet.getSparkAddress()
            const lnAddress = await wallet.getLightningAddress()
            const addresses = {
                btc: btcAddresses,
                ln: lnAddress,
                spark: sparkAddress
            }

            setAddresses(addresses)

            const prices = await wallet.fetchPrices()
            const p = prices.find(p => p.currency.toUpperCase() == currency.toUpperCase())
            if (p) {
                setPrice(p.value)
            }

            try {
                const metadata = await wallet.getTokenMetadata()
                if (metadata) {
                    setTokenMetadata(metadata)
                    await updateStats(wallet, metadata)
                }
            }
            catch (e: any) { }

            await updateBalance(wallet)

            wallet.on('synced', async () => {
                await updateBalance(wallet)

                const payments = await wallet.listPayments()
                setWalletHistory(payments)

                if (tokenMetadata) {
                    await updateStats(wallet, tokenMetadata)
                }
            })

            await refreshPaymentRequests()

            setInterval(async () => {
                const prices = await wallet.fetchPrices()
                const p = prices.find(p => p.currency.toUpperCase() == currency.toUpperCase())
                if (p) {
                    setPrice(p.value)
                }
            }, 60_000)

            setTimeout(() => {
                setInitializing(false)
            }, 800);
        }

        fetchData()
    }, [wallet])

    const refreshPaymentRequests = async () => {
        if (!wallet) return
        const paymentRequests = await fetchPaymentRequests()

        const requests = await Promise.all(paymentRequests.map(async (r) => {
            const requestSdk = await wallet.withAccountNumber(r.nonce)

            const unclaimedBitcoinDepostis = await requestSdk.listUnclaimDeposits()
            await Promise.all(unclaimedBitcoinDepostis.map(async (d) => {
                await requestSdk.claimDeposit(d.txid, d.vout)
            }))

            let balance = await requestSdk.getBalance()
            let satsBalance = Number(balance.balance)

            return {
                created_at: new Date(r.created_at * 1000),
                amount: r.amount,
                discount_rate: r.discount_rate,
                id: r.id,
                description: r.description,
                settle_tx: r.settled_tx,
                redeem_amount: r.redeem_amount,
                redeem_tx: r.redeem_tx,
                claimable: satsBalance / 100_000_000,
                nonce: r.nonce,
                settlement_mode: r.settlement_mode
            } as Payment
        }))

        setPaymentRequests(requests)
    }

    useEffect(() => {
        const fetchDetailedReceipt = async () => {
            const promises = issuanceStats.filter(r => r.type == 'mint').map(d => {
                return fetchReceiptMetadata(d.tx).then(metadata => {
                    let receipt: Receipt = {
                        date: d.date,
                        amount: d.amount,
                        transaction: d.tx,
                    }
                    if (metadata) {
                        receipt.description = metadata.description
                        receipt.recipient = metadata.recipient

                        const paymentInfo = paymentRequests.find(p => p.id == metadata.payment_id)
                        if (paymentInfo) {
                            receipt.paymentId = paymentInfo.id
                        }
                    }
                    return receipt
                })
            })

            setReceipts(await Promise.all(promises))
        }

        if (issuanceStats.length > 0) {
            fetchDetailedReceipt()
        }

    }, [issuanceStats, paymentRequests])

    const handleNewToken = async ({ name, symbol }: { name: string, symbol: string }) => {
        console.log('Creating token', name, symbol)
        if (!wallet) {
            return
        }

        try {
            const { tokenId } = await wallet.createToken(name, symbol, 0n, 1, false)
            console.log('Token created with ID:', tokenId)

            const metadata = await wallet.getTokenMetadata()
            setTokenMetadata(metadata)
        }
        catch (e) {
            const error = e as Error
            console.error(error.message)
            toast.error(error.message)
        }
    }

    const handleIssueReceipt = async (data: IssueReceiptData) => {
        const response = await wallet?.mintTokens(BigInt(data.mintableTokens) * BigInt(10 ** tokenMetadata!.decimals))
        if (!response) return
        console.log('Issued receipt with tx ID:', response?.id)

        await updateStats(wallet!, tokenMetadata!)
        await patchReceiptMetadata(response?.id, data.description || '', JSON.stringify({ name: data.recipientName || '', address: data.recipientAddress || '' }), data.paymentId)

        setIssuanceStats((prevStats) => [
            {
                date: response.timestamp,
                amount: data.mintableTokens,
                transfers: 0,
                type: 'mint',
                tx: response.id
            },
            ...prevStats
        ])
    }

    const handlePaymentRequest = async (data: PaymentRequestData) => {
        if (!wallet || !tokenMetadata) return

        const asset = { name: "Bitcoin", symbol: "BTC", max: 0 }
        await send(wallet, asset, data.feeBTC, 'spark1pgssx7lqr7akm7ycnn9hxux0mq7q8thvht3dec4ctuwvcht9pdj3qed82tfs7p', "spark")

        const { paymentRequestId } = await createPaymentRequest(wallet, data.amount, tokenMetadata.identifier, data.discountRate, data.description)
        const paymentRequest = await fetchPaymentRequest(paymentRequestId)
        setPaymentRequests((prev) => [{
            id: paymentRequestId,
            amount: data.amount,
            description: paymentRequest.description,
            created_at: new Date(paymentRequest.created_at * 1000),
            settled_tx: undefined,
            discount_rate: paymentRequest.discount_rate,
            redeem_amount: undefined,
            redeem_tx: undefined,
            claimable: 0,
            nonce: paymentRequest.nonce
        }, ...prev])
        toast.success('Payment request created successfully')
    }

    const handleRemovePaymentRequest = async (id: string) => {
        await deletePaymentRequest(id)
        setPaymentRequests((prev) => prev.filter(r => r.id !== id))
    }

    const handleClaimPaymentRequest = async (id: string) => {
        const paymentRequest = paymentRequests.find(p => p.id == id) as Payment
        if (!paymentRequest || !wallet) return

        const requestSdk = await wallet.withAccountNumber(paymentRequest.nonce)

        const asset = { name: "Bitcoin", symbol: "BTC", max: 0 }
        const sparkAddress = await wallet.getSparkAddress()
        await send(requestSdk, asset, paymentRequest.claimable, sparkAddress, 'spark')
        await refreshPaymentRequests()
    }

    const handleSend = async (method: 'spark' | 'lightning' | 'bitcoin', asset: Asset, amount: number, recipient: string) => {
        if (!wallet) return
        await send(wallet, asset, amount, recipient, method)
    }

    const handleReceiptMetadataChange = async (data: ReceiptMetadataData) => {
        await patchReceiptMetadata(data.transactionId, data.description, JSON.stringify({ name: data.recipientName, address: data.recipientAddress }), data.paymentId)
        const metadata = await fetchReceiptMetadata(data.transactionId)
        if (metadata) {
            const newReceipts = receipts.map(r => {
                if (r.transaction == data.transactionId) {
                    r.description = metadata.description
                    r.recipient = metadata.recipient,
                        r.paymentId = metadata.paymentId
                }
                return r
            })
            setReceipts(newReceipts)
        }
    }

    const tokensData: any[] = []
    if (tokenBalances) {
        for (let [_, val] of tokenBalances) {
            tokensData.push({
                id: val.tokenMetadata.identifier,
                name: val.tokenMetadata.name,
                symbol: val.tokenMetadata.symbol,
                amount: Number(val.balance) / (10 ** val.tokenMetadata.decimals)
            })
        }
    }

    return (
        <div className="flex flex-1 flex-col h-full w-full pb-10">
            <div className="flex flex-col w-full h-full">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col w-full gap-10 mt-10 px-10">
                        <div className="flex lg:flex-row flex-col gap-2 justify-between">
                            <h1 className="text-5xl font-serif font-normal text-foreground">
                                <span>Dashboard</span>
                                <span className="text-primary">& Loyalty</span>
                            </h1>

                        </div>
                        <h2 className="text-2xl font-light text-muted-foreground">Turn paid work into Bitcoin-anchored receipts that reward repeat clients.</h2>
                        {!initializing && !tokenMetadata &&
                            <Card>
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Set up your loyalty token</h2>
                                    <div className="flex flex-col text-muted-foreground gap-0">
                                        <p>Deploy a token to issue receipts for completed work and enable client discounts.</p>
                                        <p>Each time you deliver a project, you can mint tokens as proof of completed work.</p>
                                        <p>Those tokens can be redeemed for future discounts — encouraging repeated <span className="text-primary font-bold">loop of work</span>.</p>
                                    </div>
                                </CardHeader>
                                <CardFooter>
                                    <NewTokenForm onSubmit={handleNewToken} />
                                </CardFooter>
                            </Card>
                        }
                    <div className="flex lg:flex-row flex-col gap-5">

                        {initializing &&
                            <Card className="lg:w-1/4">
                                <CardHeader className="flex flex-col gap-5">
                                    <CardTitle className="text-2xl text-slate-700">Wallet</CardTitle>
                                    <CardDescription className="w-full">
                                        <div className="flex flex-col gap-2">
                                            <Skeleton className="h-7 w-20" />
                                            <Skeleton className="h-4 w-30" />
                                        </div>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-5">
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 w-20" />
                                        <Skeleton className="h-9 w-20" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-15 w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        }
                        {!initializing && wallet && addresses && <WalletCard
                            addresses={addresses}
                            btcBalance={Number(btcBalance) / (10 ** 8)}
                            tokens={tokensData}
                            tokenMetadata={tokenMetadata}
                            price={price}
                            currency={currency}
                            onSend={handleSend}
                            payments={walletHistory}
                            wallet={wallet} />}

                        <Card className="lg:w-3/4 lg:col-span-2 2xl:col-span-4">
                            <CardHeader className="flex flex-col">
                                <CardTitle className="flex 2xl:flex-row flex-col justify-between w-full gap-5">
                                    <div className="flex flex-col lg:flex-row lg:justify-between lg:w-full gap-2">
                                        <p className="text-2xl border-primary/40 flex gap-2 font-bold text-slate-700">Payment requests</p>
                                        {initializing && <Skeleton className="h-10 w-40" />}
                                        {!initializing && <CardAction className='w-full lg:w-auto'>
                                            <PaymentRequestForm onSubmit={handlePaymentRequest} price={price} />
                                        </CardAction>}
                                    </div>

                                </CardTitle>
                                <CardDescription>Request Bitcoin payments from your clients.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {initializing &&
                                    <div className="flex w-full flex-col gap-2">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div className="flex gap-4" key={index}>
                                                <Skeleton className="h-10 w-2/8" />
                                                <Skeleton className="h-10 w-1/8" />
                                                <Skeleton className="h-10 w-2/8" />
                                                <Skeleton className="h-10 w-1/8" />
                                                <Skeleton className="h-10 w-1/8" />
                                            </div>
                                        ))}
                                    </div>
                                }
                                {!initializing &&
                                    <PaymentTable
                                        data={paymentRequests.map(r => ({
                                            created_at: r.created_at,
                                            amount: r.amount,
                                            description: r.description,
                                            settle_tx: r.settle_tx,
                                            discount_rate: r.discount_rate,
                                            id: r.id,
                                            redeem_amount: r.redeem_amount,
                                            redeem_tx: r.redeem_tx,
                                            claimable: r.claimable,
                                            nonce: r.nonce,
                                            settlement_mode: r.settlement_mode
                                        }))}
                                        onRemove={handleRemovePaymentRequest}
                                        onClaim={handleClaimPaymentRequest}
                                        onDeriveReceipt={handleIssueReceipt}
                                        paymentRequests={paymentRequests}
                                        receipts={receipts} />}
                            </CardContent>
                        </Card>
                    </div>


                    {tokenMetadata &&
                        <div className="flex lg:flex-row flex-col gap-5">
                            <Card className="lg:w-1/4">
                                <CardHeader>
                                    <CardHeader className="flex flex-col p-0">
                                        <CardTitle className="flex 2xl:flex-row flex-col justify-between w-full gap-5">
                                            <p className="text-2xl text-slate-700">Receipt Program </p>
                                        </CardTitle>
                                        <CardDescription>Represents paid work that can be redeemed for future discounts</CardDescription>
                                    </CardHeader>
                                </CardHeader>
                                <CardContent className="">
                                    {initializing &&
                                        <>
                                            <Skeleton className="h-4 w-full mb-4" />
                                            <Skeleton className="h-4 w-full mb-4" />
                                            <Skeleton className="h-4 w-3/4 mt-10 mb-4" />
                                            <Skeleton className="aspect-video w-full h-20" />
                                            <Skeleton className="h-4 w-full mt-4" />
                                        </>
                                    }
                                    {!initializing && tokenMetadata &&
                                        <TokenCard tokenMetadata={tokenMetadata} issuanceStats={issuanceStats} network={wallet?.getNetwork() as string} />
                                    }
                                </CardContent>
                            </Card>
                            <Card className="lg:w-3/4 lg:col-span-1 2xl:col-span-2">
                                <CardHeader className="flex flex-col">
                                    <CardTitle className="flex 2xl:flex-row flex-col justify-between w-full gap-5">
                                        <div className="flex flex-col lg:flex-row justify-between lg:w-full gap-2">
                                            <p className="text-2xl text-slate-700">Receipts</p>
                                            <CardAction>
                                                {initializing && <Skeleton className="h-10 w-30" />}
                                                {!initializing && <IssueReceiptForm onSubmit={handleIssueReceipt} paymentRequests={paymentRequests} />}
                                            </CardAction>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Receipts issued for completed and paid work</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {initializing &&
                                        <div className="flex w-full flex-col gap-2">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <div className="flex gap-4" key={index}>
                                                    <Skeleton className="h-10 flex-1" />
                                                    <Skeleton className="h-10 flex-1" />
                                                    <Skeleton className="h-10 flex-1" />
                                                    <Skeleton className="h-10 flex-1" />
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    {!initializing &&
                                        <ReceiptTable
                                            network={wallet?.getNetwork() as string}
                                            receipts={receipts}
                                            paymentRequests={paymentRequests}
                                            onMetadataChange={handleReceiptMetadataChange} />
                                    }
                                </CardContent>
                            </Card>
                        </div>
                    }
                </div>
            </div>
        </div>
        </div >
    )
}

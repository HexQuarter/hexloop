import { NewTokenForm } from "@/components/app/new-token-form"

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { WalletCard } from "@/components/app/wallet-card"
import { type IssuanceStats } from "@/components/app/token-card"
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
import { Coins, ExternalLink, FileText, MoreHorizontal, Pickaxe, RefreshCcw, Rocket, Wallet2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RevenueChart } from "@/components/app/revenue-chart"

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

    const currency = localStorage.getItem('BITLASSO_CURRENCY') || 'USD'

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

    const revenuePayments = useMemo(() => {
        return paymentRequests
            .filter(p => p.settle_tx !== undefined)
            .reduce<{ date: string, amount: number }[]>((acc, p) => {
                if (acc.length == 0) {
                    acc.push({ date: p.created_at.toISOString().split('T')[0], amount: p.amount })
                }
                else {
                    const lastItem = acc[acc.length - 1]
                    acc.push({ date: p.created_at.toISOString().split('T')[0], amount: lastItem.amount + p.amount })
                }
                return acc
            }, [])
    }, [paymentRequests])

    const revenue = useMemo(() => {
        return paymentRequests.filter(p => p.settle_tx !== undefined).reduce((acc, p) => p.amount + acc, 0)
    }, [paymentRequests])


    const pendingPayments = useMemo(() => {
        return paymentRequests.filter(p => p.settle_tx === undefined).length
    }, [paymentRequests])

    const redeemedTokens = useMemo(() => {
        return issuanceStats.filter(s => s.type == 'burn').reduce((acc, p) => acc + p.amount, 0)
    }, [issuanceStats])

    return (
        <div className="flex flex-1 flex-col h-full w-full">
            <div className="flex flex-col w-full h-full">
                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col w-full gap-10">
                        <div className="flex flex-col gap-2 justify-between">
                            <h1 className="text-4xl font-serif font-normal text-foreground">Dashboard</h1>
                            <h2 className="text-1xl font-light text-muted-foreground">Turn paid work into Bitcoin-anchored receipts that reward repeat clients.</h2>
                        </div>
                        {tokenMetadata && initializing &&
                            <div className="grid lg:grid-cols-3 gap-2">
                                <Card className="col-span-1">
                                    <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-primary/10 p-3 rounded-full items-center"><Zap className="h-4 w-4 text-primary" /></span>
                                            Total revenue
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-5">
                                        <Skeleton className="h-10 w-1/4" />
                                        <Skeleton className="h-50 w-full" />
                                    </CardContent>
                                </Card>
                                <div className="flex flex-col gap-2 col-span-1">
                                    <Card className="flex-1">
                                        <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-primary/10 p-3 rounded-full items-center"><FileText className="h-4 w-4 text-primary" /></span>
                                                Activated payments
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-2">
                                            <Skeleton className="h-10 w-1/6" />
                                            <Skeleton className="h-10 w-1/4" />
                                        </CardContent>
                                    </Card>
                                    <Card className="flex-1">
                                        <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary/10 p-3 rounded-full items-center"><Coins className="h-4 w-4 text-primary" /></div>
                                                Minted credits
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="flex gap-1 items-center">
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-2">
                                            <Skeleton className="h-10 w-1/4" />
                                            <Skeleton className="h-10 w-1/4" />
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="flex flex-col gap-2 col-span-1">
                                    <div className="flex-1">
                                        <Card className="lg:col-span-1 h-full">
                                            <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                                <div className="flex gap-2 items-center">
                                                    <div className="bg-primary/10 p-3 rounded-full items-center"><Wallet2 className="h-4 w-4 text-primary" /></div>
                                                    Wallet
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <div className="flex gap-1 items-center">
                                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                            <span className="sr-only">Open menu</span>
                                                        </div>
                                                    </DropdownMenuTrigger>
                                                </DropdownMenu>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-5">
                                                <div className="flex flex-col gap-2">
                                                    <Skeleton className="h-9 w-1/5" />
                                                    <Skeleton className="h-5 w-1/4" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-10 w-10" />
                                                    <Skeleton className="h-10 w-10" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Skeleton className="h-50 w-full" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        }
                        {!initializing && tokenMetadata &&
                            <div className="grid lg:grid-cols-3 gap-2">
                                <Card className="col-span-1">
                                    <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-primary/10 p-3 rounded-full items-center"><Zap className="h-4 w-4 text-primary" /></span>
                                            Total revenue
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-10">
                                        <span className="text-2xl font-semibold">{Intl.NumberFormat(navigator.language || "en-US", { style: 'currency', currency: 'USD' }).format(revenue)}</span>
                                        <RevenueChart chartData={revenuePayments} />
                                    </CardContent>
                                </Card>
                                <div className="flex flex-col gap-2 col-span-1">
                                    <Card className="flex-1">
                                        <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-primary/10 p-3 rounded-full items-center"><FileText className="h-4 w-4 text-primary" /></span>
                                                Activated payments
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-2">
                                            <span className="text-2xl font-semibold">{paymentRequests.length}</span>
                                            <span className="text-xs text-muted-foreground">{pendingPayments} pendings</span>
                                        </CardContent>
                                    </Card>
                                    <Card className="flex-1">
                                        <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary/10 p-3 rounded-full items-center"><Coins className="h-4 w-4 text-primary" /></div>
                                                Minted credits
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="flex gap-1 items-center">
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                        <span className="sr-only">Open menu</span>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open(`https://sparkscan.io/token/${tokenMetadata.identifier}`, '_blank')}>View details on explorer<ExternalLink /></DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-2">
                                            <span className="text-2xl font-semibold">{issuanceStats.reduce((acc, s) => {
                                                if (s.type == 'mint') {
                                                    acc += s.amount
                                                }
                                                if (s.type == 'burn') {
                                                    acc -= s.amount
                                                }
                                                return acc
                                            }, 0)} {tokenMetadata.symbol}</span>
                                            <span className="text-muted-foreground text-xs">{redeemedTokens} redeemed</span>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex-1">
                                        {wallet && addresses &&
                                            <WalletCard
                                                addresses={addresses}
                                                btcBalance={Number(btcBalance) / (10 ** 8)}
                                                tokens={tokensData}
                                                price={price}
                                                currency={currency}
                                                onSend={handleSend}
                                                payments={walletHistory}
                                                wallet={wallet} />}
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="grid lg:grid-cols-2 gap-2">
                            {!initializing && !tokenMetadata &&
                                <Card className="flex flex-col justify-between lg:col-span-1">
                                    <CardHeader>
                                        <h2 className="border-primary/40 flex gap-2 font-serif font-light text-2xl">Set up your loyalty token</h2>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col text-sm gap-2 justify-between">
                                            <div className="bg-white border-1 border-border/40 p-4 rounded-lg group flex gap-2 items-center">
                                                <div className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/12 group-hover:ring-primary/20">
                                                    <Rocket className="h-4" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-semibold tracking-tight text-card-foreground">Deploy a token</p>
                                                    <p className="text-muted-foreground text-xs">Issue receipts for completed work and enable client discounts.</p>
                                                </div>
                                            </div>
                                            <div className="bg-white border-1 border-border/40 p-4 rounded-lg flex gap-2 items-center">
                                                <div className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/12 group-hover:ring-primary/20">
                                                    <Pickaxe className="h-4" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-semibold tracking-tight text-card-foreground">Minting</p>
                                                    <p className="text-xs text-muted-foreground ">Each time you deliver a project, you can mint tokens as proof of completed work.</p>
                                                </div>
                                            </div>
                                            <div className="bg-white border-1 border-border/40 p-4 rounded-lg flex gap-2 items-center">
                                                <div className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/12 group-hover:ring-primary/20">
                                                    <RefreshCcw className="h-4" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-semibold tracking-tight text-card-foreground">Loyalty</p>
                                                    <p className="text-xs text-muted-foreground ">Those tokens can be redeemed for future discounts — encouraging repeated <span className="text-primary font-bold">loop of work</span>.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <NewTokenForm onSubmit={handleNewToken} />
                                    </CardFooter>
                                </Card>
                            }
                            <Card className="lg:col-span-1" id="payments">
                                <CardHeader className="flex flex-col">
                                    <CardTitle className="flex lg:flex-row flex-col justify-between w-full gap-5">
                                        <div className="flex flex-col lg:flex-row lg:justify-between lg:w-full gap-2">
                                            <p className="border-primary/40 flex gap-2 font-serif font-light text-2xl">Payment requests</p>
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
                                                    <Skeleton className="h-10 w-2/8" />
                                                    <Skeleton className="h-10 w-1/8" />
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    {!initializing &&
                                        <div className="lg:max-w-full max-w-xs">
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
                                                receipts={receipts} />
                                        </div>
                                    }
                                </CardContent>
                            </Card>
                            {tokenMetadata && <Card className="lg:col-span-1" id="receipts">
                                <CardHeader className="flex flex-col">
                                    <CardTitle className="flex 2xl:flex-row flex-col justify-between w-full gap-10">
                                        <div className="flex flex-col lg:flex-row justify-between lg:w-full gap-5">
                                            <p className="text-2xl font-serif text-2xl font-light ">Receipts</p>
                                            <CardAction >
                                                {initializing && <Skeleton className="h-10 w-30" />}
                                                {!initializing && <IssueReceiptForm onSubmit={handleIssueReceipt} paymentRequests={paymentRequests} />}
                                            </CardAction>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Receipts issued for completed and paid work</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {initializing &&
                                        <div className="flex flex-col gap-2">
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
                                    <div className="lg:max-w-full max-w-xs">
                                        {!initializing &&
                                            <ReceiptTable
                                                network={wallet?.getNetwork() as string}
                                                receipts={receipts}
                                                paymentRequests={paymentRequests}
                                                onMetadataChange={handleReceiptMetadataChange} />
                                        }
                                    </div>
                                </CardContent>
                            </Card>}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

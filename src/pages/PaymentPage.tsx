import { TabsReceive, type TabType } from "@/components/app/receive-tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { confirmRedeem, fetchPaymentRequest, getPaymentPrice, type PaymentRequest } from "@/lib/api"
import { shortenAddress, sparkBech32ToHex } from "@/lib/utils"
import { Wallet } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"

import { AddressPurpose, getProviders, request, RpcErrorCode } from "sats-connect";
import { toast } from "sonner"

import LogoPng from '../../public/logo.svg'

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

export const PaymentPage: React.FC = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [paymentRequest, setPaymentRequest] = useState<undefined | PaymentRequest>(undefined)
    const [remainingRefreshTime, setRemainingRefreshTime] = useState(0)
    const [btcAmount, setBtcAmount] = useState(0)

    const [tokenBalance, setTokenBalance] = useState<undefined | { amount: number, name: string, decimals: number }>(undefined)
    const [redeemedTokens, setRedeemedTokens] = useState(0)
    const [alreadyRedeemedTokens, setAlreadyRedeemedTokens] = useState(0)
    const [wallet, setWallet] = useState<string | null>(null)
    const [availableWallet, setAvailableWallet] = useState<boolean>(false)
    const [fetchError, setFetchError] = useState<string>("")
    const [fetchErrorDetails, setFetchErrorDetails] = useState<string>("")

    const [redeemLoading, setRedeemLoading] = useState(false)
    const [redeeemError, setRedeemError] = useState<undefined | string>(undefined)

    const [sendLoading, setSendLoading] = useState(false)
    const [sendError, setSendError] = useState<undefined | string>(undefined)

    const [completed, setCompleted] = useState(false)
    const [paymentReceived, setPaymentReceived] = useState(false)
    const [selectedPaymentTab, setSelectedPaymentTab] = useState("spark")
    const [paymentAddress, setPaymentAddress] = useState<undefined | string>(undefined)

    const ran = useRef(false);

    const refreshBtc = async (paymentRequestId: string) => {
        const response = await getPaymentPrice(paymentRequestId)
        if (!response) {
            return
        }
        const { btc, endtime } = response
        setBtcAmount(btc)

        const dateNow = Date.now()
        const remainingSecs = Math.floor((endtime - dateNow) / 1000)
        setRemainingRefreshTime(remainingSecs)
        return remainingSecs
    }

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        if (id && !completed && !paymentRequest) {
            fetchPaymentRequest(id).then(async (paymentRequest) => {
                setLoading(false)
                if (paymentRequest.settled_tx) {
                    setCompleted(true)
                    setFetchError("Payment request already fullfilled.")
                    setFetchErrorDetails("The payment associated with this request has already been received and processed. If you believe this is an error, please contact the merchant for assistance.")
                    return
                }

                setPaymentRequest(paymentRequest)
                const response = getProviders()
                if (response.length > 0) {
                    setAvailableWallet(true)
                }
            })
                .catch(() => {
                    setLoading(false)
                    setFetchError('Payment request is not found.')
                    setFetchErrorDetails('The payment request you are trying to access does not exist. Please check the link or contact the merchant for assistance.')
                })
        }
    }, [])

    useEffect(() => {
        if (!paymentRequest) return
        if (paymentRequest.settled_tx) {
            setCompleted(true)
            return
        }

        setPaymentAddress(paymentRequest.spark_address)

        if (paymentRequest.redeem_amount) {
            setAlreadyRedeemedTokens(paymentRequest.redeem_amount)
            paymentRequest.amount -= paymentRequest.redeem_amount
            setPaymentRequest(paymentRequest)
        }

        const interval = setInterval(async () => {
            const request = await fetchPaymentRequest(paymentRequest.id)
            if (request.settled_tx) {
                setPaymentReceived(true)
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [paymentRequest])

    useEffect(() => {
        if (!paymentRequest || paymentReceived) return
        if (remainingRefreshTime > 0) {
            new Promise((r) => setTimeout(r, 1000)).then(() => setRemainingRefreshTime(prev => prev - 1))
        }
        else {
            refreshBtc(paymentRequest.id)
        }
    }, [paymentRequest, remainingRefreshTime, paymentReceived])

    const connectWallet = async () => {
        if (!paymentRequest) return

        const data = await request('getAccounts', { purposes: [AddressPurpose.Spark, AddressPurpose.Payment] });
        if (data.status !== 'success') {
            return;
        }
        const address = data.result.at(0)?.address;
        if (!address) {
            return;
        }

        setWallet(address);

        const sparkBalance = await request('spark_getBalance', null)
        if (sparkBalance.status == 'error') {
            return
        }

        const tokenIdentifierHex = sparkBech32ToHex(paymentRequest.token_id)
        const tokenBalance = sparkBalance.result.tokenBalances.find(tb => tb.tokenMetadata.tokenIdentifier == tokenIdentifierHex)
        if (!tokenBalance) {
            return
        }

        setTokenBalance({
            name: tokenBalance.tokenMetadata.tokenName,
            amount: parseInt(tokenBalance.balance) / (10 ** tokenBalance.tokenMetadata.decimals),
            decimals: tokenBalance.tokenMetadata.decimals
        })
    }

    const handleRedeemTokens = async () => {
        if (!paymentRequest || !tokenBalance) return
        setRedeemLoading(true)
        setRedeemError(undefined)

        const response = await request("spark_transferToken", {
            receiverSparkAddress: "spark1pgssyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszykl0d2", // Proof of Burn address
            tokenIdentifier: paymentRequest.token_id,
            tokenAmount: redeemedTokens
        });
        if (response.status == 'error') {
            setRedeemLoading(false)
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                return
            }
            setRedeemError(response.error.message)
            return
        }

        const txId = response.result.id
        await new Promise((r) => setTimeout(r, 1000))

        await confirmRedeem(paymentRequest.id, txId)
        setRedeemLoading(false)

        paymentRequest.redeem_amount = redeemedTokens
        setPaymentRequest(paymentRequest)
        toast.success('Token have been burnt and are redeemed. You can proceed to the payment with the discount applied')
    }

    const payWithXVerse = async () => {
        if (!paymentAddress) return
        setSendError(undefined)
        setSendLoading(true)
        const amountSats = BigInt(Math.floor(btcAmount * 100_000_000))
        if (selectedPaymentTab == 'spark') {
            const response = await request('spark_transfer', { amountSats: amountSats.toString(), receiverSparkAddress: paymentAddress })
            setSendLoading(false)
            if (response.status == 'error') {
                if (response.error.code === RpcErrorCode.USER_REJECTION) {
                    return
                }
                setSendError(response.error.message)
                return
            }

            setCompleted(true)
        }
        else if (selectedPaymentTab == 'btc') {
            const response = await request('sendTransfer', { recipients: [{ address: paymentAddress, amount: Number(amountSats) }] })
            setSendLoading(false)
            if (response.status === "error") {
                if (response.error.code === RpcErrorCode.USER_REJECTION) {
                    return
                }
                setSendError(response.error.message)
                return
            }

            setCompleted(true)
        }
    }

    const handleSelectPaymentChange = (tab: TabType, address: string) => {
        setSelectedPaymentTab(tab)
        setPaymentAddress(address)
    }

    const maxRedeemable = paymentRequest && !paymentRequest.redeem_amount ? paymentRequest.amount * (paymentRequest.discount_rate / 100) : 0
    const maxRedeemableToken = Math.floor(Math.max(0, maxRedeemable))

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center p-6 md:p-10 bg-slate-50">
            <div className="w-full max-w-sm md:max-w-6xl ">
                <div className="text-2xl mb-5 flex flex-col lg:flex-row justify-between items-center">
                    <a href='/'>
                        <div className='flex items-center gap-2'>
                            <img src={LogoPng} className='w-5' />
                            <div className='font-serif text-lg tracking-tight text-foreground flex items-center'>
                                <span className='text-primary'>Tx</span>
                                <span className=''>Loop</span>
                            </div>
                        </div>
                    </a>

                </div>
                <div className="flex flex-col gap-6">
                    {!loading && !fetchError && <h1 className="text-5xl font-bold font-serif font-light">Payment request</h1>}  
                    <Card className="lg:p-10">
                        <CardHeader>
                            {loading && <p className="flex items-center gap-2 text-primary text-sm">Fetching payment details... <Spinner /></p>}
                            {!loading && fetchError && <h1 className="text-3xl text-black font-serif">{fetchError}</h1>}
                            {!loading && paymentReceived && <p className="text-3xl">Payment received</p>}
                        </CardHeader>
                        <CardContent className="flex flex-col lg:flex-row">
                            {!loading && fetchErrorDetails && <p className="text-sm text-gray-500">{fetchErrorDetails}</p>}
                            {!loading && paymentReceived &&
                                <div className="flex flex-col gap-5">
                                    <p className="text-2xl text-primary">Congratulations !</p>
                                    <div className="flex flex-col">
                                        <p className="text-muted-foreground">Your payment has been received and processed.</p>
                                        <p className="text-muted-foreground">The merchand will be notified of your payment, and may be in contact with you shortly.</p>
                                        <p className="mt-8">You can now close this window. </p>
                                    </div>
                                </div>
                            }
                            {!loading && paymentRequest && !paymentReceived && (
                                <div className="flex lg:flex-row flex-col justify-between w-full gap-10">
                                    <div className="flex flex-col lg:w-1/2 gap-5 lg:p-5">
                                        <h2 className="mb-10 font-mono text-sm font-medium tracking-[0.2em] text-muted-foreground/50 uppercase">Payment details</h2>
                                        <p className="text-sm text-muted-foreground">Please review the payment details below. Once reviewed, you can proceed with the payment by following the instruction in the right panel.</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl">Amount</span>
                                            <div className="flex flex-col gap-1 text-muted-foreground">
                                                <span className="font-medium flex gap-2 items-center text-sm">
                                                    {alreadyRedeemedTokens > 0 && <span className="line-through">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paymentRequest.amount + alreadyRedeemedTokens)}</span>}
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paymentRequest.amount)}
                                                    <span className="text-sm">({btcAmount} BTC)</span></span>
                                                <span className="text-xs text-gray-500">BTC price will be refreshed in {formatTime(remainingRefreshTime)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl">Description</span>
                                            <span className="text-sm font-medium text-muted-foreground">{paymentRequest.description || 'No description provided'}</span>
                                        </div>
                                        {alreadyRedeemedTokens == 0 && maxRedeemableToken > 0 &&
                                            <div className="flex flex-col gap-1">
                                                {!availableWallet &&
                                                    <div className="flex flex-col gap-2 mt-5">
                                                        <p className="text-sm font-semibold">No compatible wallet found to redeem tokens.</p>
                                                        <Button size='sm' className='text-xs' onClick={() => window.open('https://xverse.app', '_blank')}>Please install Xverse wallet.</Button>
                                                    </div>}
                                                {availableWallet && !wallet &&
                                                    <div className="flex flex-col gap-2 mt-5">
                                                        <Button size='sm' className='text-xs' onClick={connectWallet}>Connect XVerse to redeem tokens.</Button>
                                                    </div>
                                                }
                                                {availableWallet && wallet &&
                                                    <div className="mt-2 flex flex-col gap-2">
                                                        <span className="text-xl">Loyalty discount</span>
                                                        {tokenBalance &&
                                                            <div className="flex flex-col gap-2 text-muted-foreground">
                                                                <div>
                                                                    <p className="text-sm">You have {tokenBalance.amount} <strong>{tokenBalance.name}</strong> tokens.</p>
                                                                    <p className="text-sm">You can redeem up to {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(maxRedeemable)} ({maxRedeemableToken} tokens).</p>
                                                                </div>
                                                                <div className="flex flex-col gap-2 mt-2">
                                                                    <div className="flex gap-2">
                                                                        <Input type="number" min={0} max={maxRedeemableToken} value={redeemedTokens} onChange={(e) => setRedeemedTokens(Number(e.target.value))} />
                                                                        <Button onClick={handleRedeemTokens}>Redeem tokens {redeemLoading && <Spinner />}</Button>
                                                                    </div>
                                                                    <p className="text-sm">Once redeemed, the discount will be applied to your payment.</p>
                                                                    {redeeemError && <p className="text-primary text-sm">Error: {redeeemError}</p>}
                                                                </div>
                                                            </div>
                                                        }
                                                        {!tokenBalance &&
                                                            <div>
                                                                <p className="text-sm">You dont'have tokens to redeem for that payment.</p>
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        }
                                        {alreadyRedeemedTokens > 0 &&
                                            <div className="flex flex-col gap-5">
                                                <span className="text-xl">Loyalty discount</span>
                                                <div className="flex flex-col gap-3 items-start text-muted-foreground">
                                                    <p className="text-sm">A discount have been already applied after redeeming of {alreadyRedeemedTokens} tokens.</p>
                                                    <Button variant='link' className='text-sm p-0 h-0' onClick={() => window.open(`https://sparkscan.io/tx/${paymentRequest.redeem_tx}`, '_blank')}>Check out transaction</Button>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div className="flex flex-col gap-10 rounded-sm lg:w-1/2 bg-primary/10 p-5">
                                        <div className="flex items-center justify-between flex-col lg:flex-row items-start">
                                            <h2 className="font-mono text-sm font-medium tracking-[0.2em] text-muted-foreground/50 uppercase text-primary">Payment instructions</h2>
                                            {availableWallet && !wallet && <Button className="text-xs lg:w-auto w-full" onClick={connectWallet}>Connect wallet</Button>}
                                            {wallet && <div className="flex items-center text-right text-xs text-gray-600 bg-primary/10 border-primary border-1 rounded-full p-2 text-primary">
                                                <Wallet className="h-4" />
                                                <span>Wallet: {shortenAddress(wallet)}</span>
                                            </div>}
                                        </div>
                                        {!availableWallet && <div className="flex flex-col items-start">
                                            <p className="text-xs">No browser wallet found.</p>
                                            <p className="text-xs">Please install <Button variant='link' size='sm' className='text-xs p-0' onClick={() => window.open('https://xverse.app', '_blank')}>Xverse wallet</Button> or pay directly with QR codes below.</p>
                                        </div>}
                                        <p className="text-sm text-gray-500">Select a payment method to proceed with your transaction.</p>
                                        <TabsReceive
                                            btcAddress={paymentRequest.btc_address}
                                            sparkAddress={paymentRequest.spark_address}
                                            lnAddress={paymentRequest.ln_address}
                                            onTabChange={handleSelectPaymentChange}
                                            amount={btcAmount}
                                        />
                                        {availableWallet && wallet && selectedPaymentTab != 'lightning' && (
                                            <div className="flex flex-col gap-2">
                                                <Button onClick={payWithXVerse}>Pay {sendLoading && <Spinner />}</Button>
                                                {sendError && <p className="text-primary text-sm">{sendError}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <p className="text-xs text-center text-slate-600">If you encounter any issue, please reach us to <a href='mailto:loop@hexquarter.com'>loop@hexquarter.com</a></p>
                </div>
            </div>
        </div >
    )
}
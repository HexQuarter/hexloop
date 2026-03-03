import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"


import LogoPng from '../../public/logo.svg'
import { fetchPaymentRequest, getBitcoinPrice, type PaymentRequest } from "@/lib/nostr"
import { ExternalLink } from "lucide-react"
import { shortenAddress } from "@/lib/utils"

export const CertPage: React.FC = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [paymentRequest, setPaymentRequest] = useState<undefined | PaymentRequest>(undefined)
    const [btcAmount, setBtcAmount] = useState(0)
    const [btcAmountDate, setBtcAmoundDate] = useState<undefined | Date>(undefined)
    const [txUrl, setTxUrl] = useState('')
    const [walletUrl, setWalletUrl] = useState('')

    const [fetchError, setFetchError] = useState<string>("")
    const [fetchErrorDetails, setFetchErrorDetails] = useState<string>("")

    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        if (id) {
            fetchPaymentRequest(id).then(async (paymentRequest) => {
                if (!paymentRequest.settleTx) {
                    setLoading(false)

                    setFetchError("Payment request pending.")
                    setFetchErrorDetails("You cannot generate a certificate without settlement.")
                    return
                }

                const priceDetails = await getBitcoinPrice(id)
                if (!priceDetails) {
                    return
                }
                setBtcAmount(Math.round((paymentRequest.amount / priceDetails.usdPrice) * 100000000) / 100000000)
                setBtcAmoundDate(priceDetails.date)

                if (paymentRequest.settlementMode == 'btc') {
                    setTxUrl(`https://www.blockchain.com/explorer/transactions/btc/${paymentRequest.settleTx}`)
                    setWalletUrl(`https://www.blockchain.com/explorer/addresses/btc/${paymentRequest.btcAddress}`)
                }
                else if (paymentRequest.settlementMode == 'spark') {
                    setTxUrl(`https://sparkscan.io/tx/${paymentRequest.settleTx}`)
                    setWalletUrl(`https://sparkscan.io/address/${paymentRequest.sparkAddress}`)
                }

                setPaymentRequest(paymentRequest)
                setLoading(false)

            })
                .catch(() => {
                    setLoading(false)
                    setFetchError('Payment request is not found.')
                    setFetchErrorDetails('The payment request you are trying to access does not exist. Please check the link or contact the merchant for assistance.')
                })
        }
    }, [])

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center p-6 md:p-10 bg-slate-50">
            <div className="w-full max-w-sm md:max-w-6xl ">
                <div className="text-2xl mb-5 flex flex-col lg:flex-row justify-between items-center">
                    <a href='/'>
                        <div className='flex items-center gap-2'>
                            <img src={LogoPng} className='w-10' />
                            <div className='font-serif text-4xl tracking-tight text-foreground flex items-center'>
                                <span className='text-primary'>bit</span>
                                lasso
                            </div>
                        </div>
                    </a>

                </div>
                <div className="flex flex-col gap-6">
                    {!loading && !fetchError && <h1 className="text-5xl font-bold font-serif font-light">Payment request certificate</h1>}
                    <Card className="lg:p-10">
                        <CardHeader>
                            {loading && <p className="flex items-center gap-2 text-primary text-sm">Fetching payment details... <Spinner /></p>}
                            {!loading && fetchError && <h1 className="text-4xl text-black font-serif">{fetchError}</h1>}
                        </CardHeader>
                        <CardContent className="flex flex-col lg:flex-row">
                            {!loading && fetchErrorDetails && <p className="text-gray-500">{fetchErrorDetails}</p>}
                            {!loading && paymentRequest && (
                                <div className="flex lg:flex-row flex-col justify-between w-full gap-10">
                                    <div className="flex flex-col gap-5 lg:p-5">
                                        <h2 className="font-mono text-sm font-medium tracking-[0.2em] text-muted-foreground/50 uppercase">Payment details</h2>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl">Amount</span>
                                            <div className="flex flex-col gap-1 text-muted-foreground">
                                                <span className="font-medium flex flex-col text-sm gap-1">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paymentRequest.amount + (paymentRequest.redeemAmount || 0))}
                                                    <span className="text-xs font-light">(Received: {btcAmount} BTC on {btcAmountDate?.toDateString()})</span></span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl">Description</span>
                                            <span className="text-sm text-muted-foreground">{paymentRequest.description || 'No description provided'}</span>
                                        </div>
                                        {paymentRequest.redeemTx &&
                                            <div className="flex flex-col gap-1">
                                                <div className="mt-2 flex flex-col gap-2">
                                                    <span className="text-xl">Loyalty discount</span>
                                                    <div className="flex flex-col gap-2 text-muted-foreground">
                                                        <p className="text-sm">A discount have been applied after redeeming of {paymentRequest.redeemAmount} tokens, reducing the amount to: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paymentRequest.amount)}</p>
                                                        Transaction: <a href={`https://sparkscan.io/tx/${paymentRequest.redeemTx}`} target="_blank" className="text-sm text-muted-foreground flex items-center gap-2">{shortenAddress(paymentRequest.redeemTx as string)} <ExternalLink className="h-4" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl">Settlement</span>
                                            <div className="flex flex-col gap-2">
                                                <p className="text-sm text-muted-foreground">Payment have been made on: {paymentRequest.settlementMode.toUpperCase()}</p>
                                                <p className="text-sm text-muted-foreground">Transaction: <a href={txUrl} target="_blank" className="flex items-center gap-2">{shortenAddress(paymentRequest.settleTx as string)} <ExternalLink className="h-4" /></a></p>
                                                <p className="text-sm text-muted-foreground">Destination wallet:
                                                    <a href={walletUrl} target="_blank" className="text-sm text-muted-foreground flex items-center gap-2">{paymentRequest.settlementMode == 'btc' ? shortenAddress(paymentRequest.btcAddress) : shortenAddress(paymentRequest.sparkAddress)} <ExternalLink className="h-4" /></a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <p className="text-xs text-center text-slate-600">If you encounter any issue, please reach us to <a href='mailto:bitlasso@hexquarter.com'>bitlasso@hexquarter.com</a></p>
                </div>
            </div>
        </div >
    )
}
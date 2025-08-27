import type { SparkPayment } from "@/lib/wallet"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

export const HistoryTransaction: React.FC<{ payment: SparkPayment, price: number }> = ({ payment: p, price }) => {
    return (
        <div className={`flex flex-col gap-1 justify-between rounded-sm p-3 bg-gray-50 border-gray-100 border-1 hover:bg-primary/10 hover:border-primary/20`}>
            <div className="flex gap-2 items-center">
                <div>{p.paymentType == 'receive' ? <ArrowDownCircle className="text-green-800" /> : <ArrowUpCircle className="text-red-800" />}</div>
                <div className="flex-1 text-sm text-slate-800 font-medium">
                    {p.details?.type == 'token' && `${p.amount / BigInt(10 ** p.details.metadata.decimals)} ${p.details.metadata.ticker}`}
                    {p.details?.type != 'token' && `${Number(p.amount) / 100_000_000} BTC`}
                </div>
                <div className="text-xs text-right text-slate-500">{new Date(p.timestamp * 1000).toDateString()}</div>
            </div>
            <div className="flex">
                <div className="w-8"></div>
                <div className="text-xs">
                    {p.details?.type != 'token' && new Intl.NumberFormat(navigator.language || "en-US", { style: 'currency', currency: 'USD' }).format(Math.round(Number(p.amount) / 100_000_000 * price))}
                </div>
                <div className="flex-1"></div>
            </div>
        </div>
    )
}
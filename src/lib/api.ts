export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getApiUrl = (path: string) => {
    return `${API_BASE_URL}${path}`;
}

export const confirmRedeem = async (paymentRequestId: string, txId: string): Promise<void> => {
    const response = await fetch(getApiUrl(`/payment-request/${paymentRequestId}/redeem/${txId}`), {
        method: 'POST'
    })

    if (!response.ok) {
        throw new Error('Failed to confirm payment redeem');
    }
}

export const getPaymentPrice = async (paymentRequestId: string): Promise<{ btc: number, endtime: number } | undefined> => {
    const response = await fetch(getApiUrl(`/payment-request/${paymentRequestId}/price`))
    if (!response.ok) {
        return undefined
    }

    const { btc, endtime } = await response.json()
    return { btc, endtime }
}
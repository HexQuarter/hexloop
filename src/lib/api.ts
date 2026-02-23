import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import { ec as EC } from "elliptic";
import type { Wallet } from "./wallet";

const DERIVATION_PATH = "m/84'/0'/0'/0/0";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getApiUrl = (path: string) => {
    return `${API_BASE_URL}${path}`;
}

export const authenticateUser = async (mnemonic: string): Promise<{ token: string, expiresAt: number }> => {
    const seed = mnemonicToSeedSync(mnemonic);
    const hd = HDKey.fromMasterSeed(seed);
    const child = hd.derive(DERIVATION_PATH);

    const ec = new EC("secp256k1");

    if (!child.privateKey) throw new Error("No private key derived");
    const key = ec.keyFromPrivate(child.privateKey);
    const pubKeyHex = key.getPublic(true, "hex");

    const url = new URL(getApiUrl('/auth/challenge'));
    url.searchParams.append('publicKey', pubKeyHex);

    const challengeRes = await fetch(url, {
        method: 'GET',
    })
    if (!challengeRes.ok) {
        const { error } = await challengeRes.json()
        throw new Error(error)
    }
    const challenge = await challengeRes.json()

    if (!challenge || !challenge.nonce) {
        throw new Error("Failed to get challenge from server")
    }

    const { nonce } = challenge;
    const message = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`loopofwork:${nonce}`));

    const signature = key.sign(new Uint8Array(message), { canonical: true });
    const sigDer = signature.toDER("hex");

    const response = await fetch(getApiUrl('/auth/verify'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicKey: pubKeyHex, signature: sigDer, nonce }),
    });

    if (!response.ok) {
        throw new Error('Authentication failed');
    }

    const { sessionId, expiresAt } = await response.json();
    return { token: sessionId, expiresAt };
}

export const checkSessionValidity = async (token: string) => {
    const response = await fetch(getApiUrl('/auth/check'), {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        throw new Error("Session invalid")
    }
}

export const fetchReceiptMetadata = async (transactionId: string) => {
    const token = localStorage.getItem('LOP_SESSION_TOKEN');
    if (!token) {
        throw new Error('No session token found');
    }
    const response = await fetch(getApiUrl(`/receipt/${transactionId}`), {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    if (response.status === 404) {
        return null; // No metadata found
    }
    if (!response.ok) {
        throw new Error('Failed to fetch receipt metadata');
    }
    const { receipt } = await response.json();
    return receipt;
}

export const patchReceiptMetadata = async (transactionId: string, description?: string, recipient?: string, paymentId?: string) => {
    const token = localStorage.getItem('LOP_SESSION_TOKEN');
    if (!token) {
        throw new Error('No session token found');
    }
    const response = await fetch(getApiUrl(`/receipt/${transactionId}`), {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, recipient, paymentId }),
    })
    if (!response.ok) {
        throw new Error('Failed to update receipt metadata');
    }

    const data = await response.json();
    return data;
}

export const createPaymentRequest = async (wallet: Wallet, amount: number, tokenId: string, discountRate: number, description?: string): Promise<{ paymentRequestId: string }> => {
    const token = localStorage.getItem('LOP_SESSION_TOKEN');
    if (!token) {
        throw new Error('No session token found');
    }

    const resNonce = await fetch(getApiUrl('/payment-request-nonce'), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    })
    if (!resNonce.ok) {
        throw new Error('Failed to fetch derivation nonce');
    }

    const { nonce } = await resNonce.json()
    const derivationId = nonce + 1

    const btcAddress = await wallet.createBitcoinAddress(derivationId);
    const sparkAddress = await wallet.createSparkAddress(derivationId)

    const subLightningWallet = await wallet.withAccountNumber(derivationId)
    const { invoice: lnAddress } = await subLightningWallet.createLightningInvoice();

    const response = await fetch(getApiUrl('/payment-request'), {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, description, btcAddress, sparkAddress, lnAddress, tokenId, discountRate, nonce: derivationId }),
    })
    if (!response.ok) {
        throw new Error('Failed to create payment request');
    }

    const data = await response.json();
    return data;
}

export const fetchPaymentRequests = async (): Promise<Array<PaymentRequest>> => {
    const token = localStorage.getItem('LOP_SESSION_TOKEN');
    if (!token) {
        throw new Error('No session token found');
    }
    const response = await fetch(getApiUrl('/payment-requests'), {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        throw new Error('Failed to fetch payment requests');
    }

    const data = await response.json();
    return data.paymentRequests;
}

export const fetchPaymentRequest = async (id: string): Promise<PaymentRequest> => {
    const response = await fetch(getApiUrl(`/payment-request/${id}`))
    if (!response.ok) {
        throw new Error('Failed to fetch payment request');
    }

    const data = await response.json();
    return data.paymentRequest;
}

export const deletePaymentRequest = async (id: string): Promise<void> => {
    const token = localStorage.getItem('LOP_SESSION_TOKEN');
    if (!token) {
        throw new Error('No session token found');
    }
    const response = await fetch(getApiUrl(`/payment-request/${id}`), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        throw new Error('Failed to delete payment request');
    }
}

export const confirmRedeem = async (paymentRequestId: string, txId: string): Promise<void> => {
    const response = await fetch(getApiUrl(`/payment-request/${paymentRequestId}/redeem/${txId}`), {
        method: 'POST'
    })

    if (!response.ok) {
        throw new Error('Failed to confirm payment redeem');
    }
}

export const confirmSettled = async (paymentRequestId: string, txId: string): Promise<void> => {
    const token = localStorage.getItem('LOP_SESSION_TOKEN');
    if (!token) {
        throw new Error('No session token found');
    }
    const response = await fetch(getApiUrl(`/payment-request/${paymentRequestId}/settle/${txId}`), {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })

    if (!response.ok) {
        throw new Error('Failed to confirm payment settlement');
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

export type PaymentRequest = {
    id: string,
    amount: number;
    description: string | undefined;
    btc_address: string,
    spark_address: string,
    ln_address: string,
    settled_tx: string | undefined,
    discount_rate: number,
    token_id: string,
    created_at: number
    redeem_amount?: number
    redeem_tx?: string
    nonce: number
    settlement_mode: "spark" | "btc"
}
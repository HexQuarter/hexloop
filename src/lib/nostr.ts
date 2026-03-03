import type { NotificationSettings } from "@/components/app/notification-setting";
import { SimplePool, getPublicKey } from "nostr-tools"

import { HDKey } from "@scure/bip32";
import { bech32 } from "bech32";
import { bytesToHex, hexToBytes } from "nostr-tools/utils";
import { mnemonicToSeedSync } from "@scure/bip39";
import type { Wallet } from "./wallet";
import type { Payment } from "@/components/app/payment-table";
import type { Receipt } from "@/components/app/receipt-table";

const pool = new SimplePool();
const RELAYS = [
    "wss://relay.damus.io",
    "wss://relay.primal.net",
    "wss://nos.lol"
];

enum EventKind {
    PAYMENT_REQ = 30003,
    RECEIPT_METADATA = 30004,
    NOTIF_SETTING = 30005,
    BTC_PRICE = 30010,
    BTC_PAYMENT = 30011,
    SPARK_REDEEM = 30012
}

export type NostrKeyPair = {
    pub: string
    priv: string
    npub: string
    nsec: string
}

export const getNostrKeyPair = (mnemonic: string): NostrKeyPair => {
    const seed = mnemonicToSeedSync(mnemonic)
    const hdkey = HDKey.fromMasterSeed(seed);
    const privateKey = hdkey.derive("m/44'/1237'/0'/0/0").privateKey;
    if (!privateKey) {
        throw new Error('Cannot derive Nostr private key')
    }
    const publicKey = getPublicKey(privateKey)
    const pkBytes = hexToBytes(publicKey);

    const nsec = bech32.encode('nsec', bech32.toWords(privateKey)); // Truncate version byte if needed
    const npub = bech32.encode('npub', bech32.toWords(pkBytes));
    return {
        pub: publicKey,
        priv: bytesToHex(privateKey),
        nsec: nsec,
        npub: npub
    }
}

export const registerNotifSettings = async (wallet: Wallet, notifSettings: NotificationSettings) => {
    const event = {
        kind: EventKind.NOTIF_SETTING,
        content: JSON.stringify(notifSettings),
        pubkey: wallet.getNostrPublicKey(),
        created_at: Math.floor(Date.now() / 1000),
        tags: [["n", "0"]] // link to notification settings
    }

    const signedEvent = wallet.signNostrEvent(event);
    await Promise.all(pool.publish(RELAYS, signedEvent))
}

export const getNotifSettings = async (wallet: Wallet): Promise<NotificationSettings | undefined> => {
    const events = await pool.querySync(RELAYS, {
        kinds: [EventKind.NOTIF_SETTING],
        authors: [wallet.getNostrPublicKey()],
        "#n": ["0"] // link to notification settings
    });
    if (events.length > 0) {
        const { content } = events[0]
        return JSON.parse(content)
    }
    return undefined
}

export const publishPaymentRequest = async (wallet: Wallet, nonce: number, amount: number, tokenId: string, discountRate: number, description?: string) => {
    const btcAddress = await wallet.createBitcoinAddress(nonce);
    const sparkAddress = await wallet.createSparkAddress(nonce)

    const subLightningWallet = await wallet.withAccountNumber(nonce)
    const { invoice: lnAddress } = await subLightningWallet.createLightningInvoice();
    const event = {
        kind: EventKind.PAYMENT_REQ,
        content: JSON.stringify({ amount, discountRate, description, btcAddress, sparkAddress, lnAddress }),
        pubkey: wallet.getNostrPublicKey(),
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["nonce", (nonce + 1).toString()],
            ["token", tokenId]
        ]
    }

    const signedEvent = wallet.signNostrEvent(event);
    await Promise.all(pool.publish(RELAYS, signedEvent))
    return {
        id: signedEvent.id,
        createdAt: signedEvent.created_at
    }
}

export const removePaymentRequest = async (wallet: Wallet, id: string) => {
    const event = {
        kind: 5,
        content: '',
        pubkey: wallet.getNostrPublicKey(),
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["e", id]
        ]
    }
    const signedEvent = wallet.signNostrEvent(event)
    await Promise.all(pool.publish(RELAYS, signedEvent))
}

export const fetchPaymentsRequest = async (wallet: Wallet): Promise<Payment[]> => {
    const events = await pool.querySync(RELAYS, {
        kinds: [EventKind.PAYMENT_REQ],
        authors: [wallet.getNostrPublicKey()]
    });

    if (events.length == 0) return []

    return await Promise.all(events.map(async (e) => {
        const { id, content, tags, created_at } = e
        let paymentRequest = JSON.parse(content) as Payment
        paymentRequest.id = id
        paymentRequest.createdAt = new Date(created_at * 1000)
        if (tags.length > 0) {
            const tagsMap = new Map<string, string>(tags as [string, string][])
            const nonce = tagsMap.get('nonce')
            if (nonce) {
                paymentRequest.nonce = Number(nonce)
            }
        }

        const paymentDetails = await fetchPaymentDetails(id)
        if (paymentDetails) {
            const { settlementMode, transaction } = paymentDetails
            paymentRequest.settleTx = transaction
            paymentRequest.settlementMode = settlementMode
        }

        return paymentRequest
    }))
}

export const fetchPaymentRequest = async (id: string): Promise<PaymentRequest> => {
    const events = await pool.querySync(RELAYS, {
        kinds: [EventKind.PAYMENT_REQ],
        ids: [id]
    });
    if (events.length == 0) {
        throw new Error('Payment not found')
    }

    const { content, tags, created_at } = events[0]
    let paymentRequest = JSON.parse(content) as PaymentRequest
    paymentRequest.id = id
    paymentRequest.createdAt = new Date(created_at * 1000)
    if (tags.length > 0) {
        const tagsMap = new Map<string, string>(tags as [string, string][])
        const nonce = tagsMap.get('nonce')
        if (nonce) {
            paymentRequest.nonce = Number(nonce)
        }

        const tokenId = tagsMap.get('token')
        if (tokenId) {
            paymentRequest.tokenId = tokenId
        }
    }

    const paymentDetails = await fetchPaymentDetails(id)
    if (paymentDetails) {
        const { settlementMode, transaction } = paymentDetails
        paymentRequest.settleTx = transaction
        paymentRequest.settlementMode = settlementMode
    }

    const redeemDetails = await fetchRedeemDetails(id)
    if (redeemDetails) {
        paymentRequest.redeemAmount = redeemDetails.redeemAmount
        paymentRequest.redeemTx = redeemDetails.transaction
    }

    return paymentRequest
}

const fetchPaymentDetails = async (requestId: string) => {
    const events = await pool.querySync(RELAYS, {
        kinds: [EventKind.BTC_PAYMENT],
        authors: [import.meta.env.VITE_API_NOSTR_PUB],
        "#f": [requestId]
    });
    if (events.length == 0) {
        return undefined
    }

    const tagsMap = new Map<string, string>(events[0].tags as [["string", 'string']])
    return {
        settlementMode: tagsMap.get('s') as 'btc' | 'spark',
        transaction: tagsMap.get('t'),
        refPriceId: tagsMap.get('refPriceId')
    }
}

const fetchRedeemDetails = async (requestId: string) => {
    const events = await pool.querySync(RELAYS, {
        kinds: [EventKind.SPARK_REDEEM],
        authors: [import.meta.env.VITE_API_NOSTR_PUB],
        "#f": [requestId]
    });
    if (events.length == 0) {
        return undefined
    }

    const tagsMap = new Map<string, string>(events[0].tags as [["string", 'string']])
    return {
        redeemAmount: Number(tagsMap.get('a')),
        transaction: tagsMap.get('t'),
    }
}

export type PaymentRequest = {
    id: string,
    amount: number;
    description: string | undefined;
    btcAddress: string,
    sparkAddress: string,
    lnAddress: string,
    settleTx: string | undefined,
    discountRate: number,
    tokenId: string,
    createdAt: Date
    redeemAmount?: number
    redeemTx?: string
    nonce: number
    settlementMode: "spark" | "btc"
}

export const publishReceiptMetadata = async (wallet: Wallet, transactionId: string, amount: number, createdAt: Date, description?: string, recipient?: string, paymentId?: string) => {
    const event = {
        kind: EventKind.RECEIPT_METADATA,
        content: JSON.stringify({
            amount,
            description,
            recipient
        }),
        pubkey: wallet.getNostrPublicKey(),
        created_at: Math.floor(createdAt.getTime() / 1000),
        tags: [
            ["d", transactionId]
        ]
    }

    if (paymentId) {
        event.tags.push(["p", paymentId])
    }

    const signedEvent = wallet.signNostrEvent(event);
    await Promise.all(pool.publish(RELAYS, signedEvent))
}

export const listReceipts = async (wallet: Wallet): Promise<Receipt[]> => {
    const events = await pool.querySync(RELAYS, {
        kinds: [EventKind.RECEIPT_METADATA],
        authors: [wallet.getNostrPublicKey()]
    });
    if (events.length == 0) {
        return []
    }

    return events.map(e => {
        const { content, tags, created_at } = e
        const { amount, description, recipient } = JSON.parse(content) as { amount: number, description?: string, recipient?: string }
        const tagsMap = new Map<string, string>(tags as [["string", 'string']])

        return {
            date: new Date(created_at * 1000),
            amount: amount,
            description: description,
            recipient: recipient,
            paymentId: tagsMap.get("p"),
            transaction: tagsMap.get("d")
        } as Receipt
    })
}
import type React from "react";
import { useEffect, useState } from "react";

import * as bip39 from '@scure/bip39';
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Spinner } from "./ui/spinner";

type Props = {
    onSubmit: (mnemonic: string) => void
    onBack: () => void
    loading: boolean
}

export const CreateWalletForm: React.FC<Props> = ({ onSubmit, onBack ,loading = false}) => {
    const [mnemonic, setMnemonic] = useState<string[]>(["", "", "", "", "", "", "", "", "", "", "", ""]);

    useEffect(() => {
        const generatedMnemonic = bip39.generateMnemonic(wordlist);
        setMnemonic(generatedMnemonic.split(' '));
    }, []);


    const copy = async () => {
        await navigator.clipboard.writeText(mnemonic.join(' '))
        const toastId = toast.info('Your passphrase have been copied into the clipboard')
        setTimeout(() => {
            toast.dismiss(toastId)
        }, 2000)
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                    <p className="text-sm">Write these words down safely as they unlock your wallet.</p>
                    <p className="text-sm">Be careful, no one can help if you lose this.</p>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {mnemonic.map((word, index) => (
                            <div className='border-1 border-input items-center flex justify-center rounded-sm text-black font-medium shadow-xs text-sm h-9' key={index}>{word}</div>
                        ))}
                    </div>
                    <div className='flex text-sm text-gray-600 gap-2 justify-end' onClick={() => copy()}>
                        <Copy className="w-5" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 items-center">
                <Button variant='outline' className="w-full" onClick={() => onBack()}>Back</Button>
                <Button type="submit" className='w-full' onClick={() => onSubmit(mnemonic.join(' '))} disabled={loading}>{loading && <Spinner />} Open the app</Button>
            </div>
        </div>
    )
}
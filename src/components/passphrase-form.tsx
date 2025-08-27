import type React from "react";
import { useEffect, useState } from "react";

import * as bip39 from '@scure/bip39';
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "./ui/spinner";

type Props = {
    onSubmit: (mnemonic: string) => void
    loading: boolean
    onBack: () => void
}

export const PassphraseForm: React.FC<Props> = ({ onSubmit, onBack, loading = false }) => {
    const [mnemonic, setMnemonic] = useState<string[]>(["", "", "", "", "", "", "", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [valid, setValid] = useState<boolean>(false);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();

            setError(null);
            const clipboardData = e.clipboardData || (window as any).clipboardData;
            const pastedText = clipboardData.getData('Text').trim();

            const passphrase = [...Array(12)].map(() => '');
            const words = pastedText.split(/\s+/)
            words.forEach((word: string, index: number) => {
                passphrase[index] = word;
            });

            if (!bip39.validateMnemonic(passphrase.join(' '), wordlist)) {
                setValid(false);
                setError('Invalid passphrase. Please check the words and try again.');
                return;
            }

            setMnemonic(passphrase);
            setValid(true);
        };

        // Attach to the first input for simplicity
        const input = document.querySelector('input');
        if (input) {
            input.addEventListener('paste', handlePaste as any);
        }
        return () => {
            if (input) {
                input.removeEventListener('paste', handlePaste as any);
            }
        };

    }, []);

    const handleMnemonicChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setError(null);
        const updated = [...mnemonic];
        updated[index] = e.target.value;
        const filledWords = updated.filter(word => word !== '').length;
        setMnemonic(updated);

        if (filledWords == 12 && !bip39.validateMnemonic(updated.join(' '), wordlist)) {
            setValid(false);
            setError('Invalid passphrase. Please check the words and try again.');
            return;
        }

        if (filledWords == 12) {
            setValid(true);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(mnemonic.join(' '))
    }

    return (
        <form className="bg-white" onSubmit={handleSubmit}>
            <FieldGroup>
                <FieldLabel>Enter your passphrase</FieldLabel>
                <div className="grid grid-cols-3 gap-4 text-center">
                    {mnemonic.map((_word, index) => (
                        <Field key={index}>
                            <Input
                                className="text-gray-500 text-sm"
                                required
                                onChange={(e) => {
                                    handleMnemonicChange(e, index);
                                }}
                                value={mnemonic[index]}
                            />
                        </Field>
                    ))}
                </div>
                <Button variant='link' onClick={() => onBack()}>Back</Button>
                {error && <p className="col-span-3 text-red-500 text-sm italic mt-2">{error}</p>}
                <Field>
                    {valid && <Button type="submit" disabled={loading}>{loading && <Spinner />} Connect this wallet to the app</Button>}
                </Field>
            </FieldGroup>
        </form>
    )
}
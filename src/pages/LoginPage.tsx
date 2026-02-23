import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

import { PassphraseForm } from "@/components/app/passphrase-form";
import { CreateWalletForm } from "@/components/app/create-wallet-form";
import { useNavigate } from "react-router";
import { useWallet } from "@/hooks/use-wallet";
import { authenticateUser } from "@/lib/api";
import { ArrowRight } from "lucide-react";

import LogoPng from '../../public/logo.svg'

export const LoginPage = () => {
    const { storeWallet } = useWallet()
    const [showPassphraseForm, setShowPassphraseForm] = useState(false)
    const [showCreateWalletForm, setShowCreateWalletForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handlePassphraseSubmit = async (mnemonic: string) => {
        setLoading(true)
        console.log('authenticating user...')
        const { token, expiresAt } = await authenticateUser(mnemonic)
        localStorage.setItem('LOP_SESSION_TOKEN', token)
        localStorage.setItem('LOP_SESSION_EXPIRES_AT', expiresAt.toString())
        await storeWallet(mnemonic)

        setLoading(false)
        navigate('/app/dashboard', { replace: true })
    }

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center p-6 md:p-10 bg-primary/10">
            <div className="w-full max-w-sm md:max-w-6xl ">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden p-0 z-20">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="flex flex-col gap-10 p-5 lg:p-20 ">
                                <div className="flex flex-col items-center gap-10">
                                    <h1 className="w-full font-serif text-4xl font-normal text-foreground">
                                        Create your loop's <span className="text-primary">workspace</span>
                                    </h1>
                                    <div className="text-left flex flex-col gap-5 w-full">
                                        <p className="text-muted-foreground">Sign in with a Spark-compatible Bitcoin wallet to issue work receipts and manage loyalty.</p>
                                    </div>
                                </div>
                                {!showPassphraseForm && !showCreateWalletForm &&
                                    <div className="flex flex-col lg:flex-row items-center justify-center gap-2">
                                        <button className="justify-center flex items-center gap-2 w-full rounded-full bg-foreground px-8 py-4 text-[15px] font-medium text-background transition-all duration-300 hover:shadow-lg hover:shadow-foreground/10 hover:bg-primary hover:cursor-pointer" onClick={() => setShowPassphraseForm(true)}>
                                            Connect wallet
                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </button>
                                        <button className="justify-center flex items-center gap-2 w-full rounded-full bg-none text-primary px-8 py-4 text-[15px] font-medium text-background transition-all duration-300 hover:shadow-lg hover:border-primary border-1 hover:bg-primary/10 hover:shadow-foreground/10 hover:cursor-pointer" onClick={() => setShowCreateWalletForm(true)}>
                                            Create wallet
                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                }
                                {showPassphraseForm &&
                                    <PassphraseForm onSubmit={handlePassphraseSubmit} onBack={() => setShowPassphraseForm(false)} loading={loading} />
                                }
                                {showCreateWalletForm &&
                                    <CreateWalletForm onSubmit={handlePassphraseSubmit} onBack={() => setShowCreateWalletForm(false)} loading={loading} />
                                }
                                <p className="text-xs px-6 text-slate-400 text-center">Non-custodial. Your keys stay with you.</p>
                            </div>
                            <div className="bg-gray-50 flex relative text-2xl lg:text-5xl items-center flex h-30 lg:h-full justify-center">
                                <div className='flex items-center gap-2'>
                                    <img src={LogoPng} className='w-10 lg:w-20' />
                                    <div className='font-serif text-3xl lg:text-5xl tracking-tight text-foreground flex items-center'>
                                        <span className='text-primary'>Tx</span>
                                        <span className=''>Loop</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
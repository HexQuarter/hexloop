import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Logo } from "@/components/logo";

import { PassphraseForm } from "@/components/passphrase-form";
import { CreateWalletForm } from "@/components/create-wallet-form";
import { useNavigate } from "react-router";
import { useWallet } from "@/hooks/use-wallet";
import { authenticateUser } from "@/lib/api";

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
        console.log(token)
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
                            <div className="flex flex-col gap-10 p-5 lg:p-20 bg-white">
                                <div className="flex flex-col items-center gap-10">
                                    <h1 className="text-5xl w-full">Access your receipt <span className="text-primary">workspace</span></h1>
                                    <div className="text-left flex flex-col gap-5 w-full">
                                        <p className="text-slate-600 text-xl">Sign in with a Spark-compatible Bitcoin wallet to issue work receipts and manage loyalty.</p>
                                        {/* <p className="">Issue work receipts, manage payments, and power client discounts — <span className="text-primary font-semibold">fully non-custodial.</span></p> */}
                                    </div>
                                </div>
                                {!showPassphraseForm && !showCreateWalletForm &&
                                    <div className="flex flex-col lg:flex-row items-center justify-center gap-2">
                                        <Button className="w-full lg:w-auto bg-black" onClick={() => setShowPassphraseForm(true)}>Connect wallet</Button>
                                        <Button variant='outline' className="w-full lg:w-auto text-primary" onClick={() => setShowCreateWalletForm(true)}>Create wallet</Button>
                                    </div>
                                }
                                {showPassphraseForm &&
                                    <PassphraseForm onSubmit={handlePassphraseSubmit} onBack={() => setShowPassphraseForm(false)} loading={loading} />
                                }
                                {showCreateWalletForm &&
                                    <CreateWalletForm onSubmit={handlePassphraseSubmit} onBack={() => setShowCreateWalletForm(false)} loading={loading} />
                                }
                                <p className="text-xs px-6 text-slate-400 text-center">Non-custodial. <br />Your keys stay with you.</p>
                            </div>
                            <div className="bg-gray-50 flex relative text-2xl lg:text-5xl items-center flex h-20 lg:h-full justify-center">
                                <Logo />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
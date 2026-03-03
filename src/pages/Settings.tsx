import { useEffect, useState } from "react"

import { getNotifSettings, registerNotifSettings } from "@/lib/nostr"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { IconNotification } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"
import { type NotificationSettings } from "@/components/app/notification-setting"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SaveAll } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

export const SettingsPage = () => {
    const { wallet } = useWallet()
    const [initializing, setInitializing] = useState(true)
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ email: '', npub: '' })

    useEffect(() => {
        if (!wallet) return
        const fetchData = async () => {
            const notif = await getNotifSettings(wallet)
            if (notif) {
                setNotificationSettings(notif)
            }
            setInitializing(false)
        }

        fetchData()
    }, [wallet])

    const handleEmailChange = (val: string) => {
        setNotificationSettings({ email: val, npub: notificationSettings.npub })
    }

    const handleNpubChange = (val: string) => {
        setNotificationSettings({ email: notificationSettings.email, npub: val })
    }

    const handleSave = async () => {
        if (!wallet) return
        await registerNotifSettings(wallet, notificationSettings)
    }

    return (
        <div className="flex flex-1 flex-col h-full w-full">
            <div className="flex flex-col w-full h-full">
                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col w-full gap-10">
                        <div className="flex flex-col gap-2 justify-between">
                            <h1 className="text-4xl font-serif font-normal text-foreground">Settings</h1>
                            <h2 className="text-1xl font-light text-muted-foreground">Configure your workspace.</h2>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-2">
                            <Card className="col-span-1">
                                <CardHeader className="font-mono uppercase tracking-wider text-gray-500 text-xs flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary/10 p-3 rounded-full items-center"><IconNotification className="h-4 w-4 text-primary" /></span>
                                        Notification settings
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-5">
                                    {initializing &&
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </>
                                    }
                                    {!initializing &&
                                        <>
                                            <div className="flex flex-col gap-2 w-full">
                                                <Label htmlFor='email' className="text-sm">Email:</Label>
                                                <Input
                                                    id='email'
                                                    className="text-xs"
                                                    value={notificationSettings.email}
                                                    onChange={(e) => handleEmailChange(e.target.value)} />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <Label htmlFor='npub' className="text-sm">Nostr pub:</Label>
                                                <Input
                                                    id='npub'
                                                    className="text-xs"
                                                    value={notificationSettings.npub}
                                                    placeholder="npub..."
                                                    onChange={(e) => handleNpubChange(e.target.value)} />
                                            </div>
                                            <div>
                                                <Button
                                                    className="text-sm flex items-center gap-2 border-0 hover:border-1"
                                                    variant='outline'
                                                    onClick={handleSave} ><SaveAll /> Save</Button>
                                            </div>
                                        </>
                                    }
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

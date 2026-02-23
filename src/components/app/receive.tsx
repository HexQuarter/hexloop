import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Addresses } from "@/hooks/use-wallet";
import { TabsReceive } from "./receive-tabs";
import { ArrowDown } from "lucide-react";

type Props = {
    addresses: Addresses
}

export const Receive: React.FC<Props> = ({ addresses }) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)} >
                <Button className="w-full hover:bg-primary hover:text-white text-muted-foreground" variant='outline' >
                    Receive
                    <ArrowDown />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-50 p-10 flex flex-col gap-10">
                <DialogHeader>
                    <DialogTitle className="font-serif text-3xl font-light">Receive funds</DialogTitle>
                </DialogHeader>
                <TabsReceive btcAddress={addresses.btc} sparkAddress={addresses.spark} lnAddress={addresses.ln} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="bg-white">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import type { Addresses } from "@/hooks/use-wallet";
import { TabsReceive } from "./ receive_tabs";

type Props = {
    addresses: Addresses
}

export const Receive: React.FC<Props> = ({ addresses }) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)} >
                <Button className="bg-gray-50 border-gray-100 w-full hover:bg-primary/10 hover:border-primary/20 hover:scale-110 transition-all duration-300"
                    variant='outline'>
                    Receive
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-50">
                <DialogHeader>
                    <DialogTitle>Receive funds</DialogTitle>
                </DialogHeader>
                <TabsReceive btcAddress={addresses.btc} sparkAddress={addresses.spark} lnAddress={addresses.ln} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
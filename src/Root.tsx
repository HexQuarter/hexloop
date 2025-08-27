import { HashRouter, Route, Routes } from "react-router"
import { LandingPage } from "./pages/LandingPage"
import { AppRoot } from "./AppRoot"
import { WalletProvider } from "./hooks/use-wallet"
import { Toaster } from "sonner"
import { PaymentPage } from "./pages/PaymentPage"

export const Root = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path='/' Component={LandingPage} />
                <Route path='/app/*' element={
                    <WalletProvider>
                        <AppRoot />
                    </WalletProvider>
                } />
                <Route path='/payment/:id' Component={PaymentPage} />
            </Routes>
            <Toaster />
        </HashRouter>
    )
}
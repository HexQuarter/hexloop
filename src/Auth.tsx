import { Route, Routes } from "react-router"
import { LoginPage } from "./pages/auth/LoginPage"

export const Auth = () => {
    return (
        <Routes>
            <Route path='/' Component={LoginPage} />
        </Routes>
    )
}
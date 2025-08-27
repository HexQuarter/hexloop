import { useEffect, useState } from 'react'
import './App.css'
import App from './App.tsx'
import { Auth } from './Auth.tsx'
import { SiteHeader } from './components/site-header.tsx'
import { useWallet } from './hooks/use-wallet.tsx'
import { Spinner } from "@/components/ui/spinner"
import { authenticateUser, checkSessionValidity } from './lib/api.ts'

export const AppRoot = () => {
  const { wallet, walletExists } = useWallet()
  const [connected, setConnected] = useState(false)
  const [requireRegister, setRequireRegister] = useState(false)

  useEffect(() => {
    if (walletExists) {
      const token = localStorage.getItem('LOP_SESSION_TOKEN')

      if (token) {
        checkSessionValidity(token)
          .then(() => { setConnected(true) })
          .catch(() => {
            const mnemonic = localStorage.getItem('LOP_MNEMONIC')

            if (mnemonic) {
              authenticateUser(mnemonic)
                .then(({ token, expiresAt }) => {
                  localStorage.setItem('LOP_SESSION_TOKEN', token)
                  localStorage.setItem('LOP_SESSION_EXPIRES_AT', expiresAt.toString())
                  setConnected(true)
                })
                .catch((e: Error) => {
                  setConnected(false)
                  if (e.message == 'ACCOUNT_NOT_FOUND') {
                    setRequireRegister(true)
                    return
                  }
                })
            }
            else {
              setConnected(false)
            }
          })
      }
      else {
        setRequireRegister(true)
        setConnected(false)
      }
    }
  }, [walletExists])

  // show spinner while wallet check / effect is running
  if (((walletExists || wallet) && !connected) && !requireRegister) {
    return (
      <div className='flex text-primary items-center justify-center h-screen'>
        <Spinner className='size-8' />
      </div>
    )
  }

  if (requireRegister || (!wallet && !connected)) {
    console.log('auth', wallet, connected)
    return <Auth />
  }

  return (
    <div className='@container/main flex flex-col h-full bg-slate-50'>
      <SiteHeader />
      <div className="flex-col min-h-screen">
        <App />
      </div>
    </div>
  )
}
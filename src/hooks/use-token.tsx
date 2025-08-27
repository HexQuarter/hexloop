import type { IssuerSparkWallet, IssuerTokenMetadata } from "@buildonspark/issuer-sdk";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface TokenContextType {
  tokenMetadata: IssuerTokenMetadata | null;
  reloadTokenMetadata: () => Promise<IssuerTokenMetadata | undefined>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children, wallet }: { children: ReactNode, wallet: IssuerSparkWallet | null }) {
  const [tokenMetadata, setTokenMetadata] = useState<IssuerTokenMetadata | null>(null)

  useEffect(() => {
    const fetch = async () => {
      if (!wallet) return

      try {
        const tokenMetadata = await wallet.getIssuerTokenMetadata()
        setTokenMetadata(tokenMetadata)
      }
      catch (e) { }
    }

    fetch()
  }, [])

  const reloadTokenMetadata = async () => {
    if (!wallet) {
      return undefined
    }

    try {
      const tokenMetadata = await wallet.getIssuerTokenMetadata()
      setTokenMetadata(tokenMetadata)
      return tokenMetadata
    }
    catch (e) {
      console.log(`Error reloading token metadata: ${e}`)
      return undefined
    }
  }

  return (
    <TokenContext.Provider value={{ tokenMetadata, reloadTokenMetadata }}>
      {children}
    </TokenContext.Provider>
  )
}

export function useToken() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useContext must be used within TokenProvider');
  }
  return context;
}
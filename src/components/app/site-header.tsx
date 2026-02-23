import { IconDashboard, type Icon } from "@tabler/icons-react"
import { Link, useLocation, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { shortenAddress } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, MoreVertical } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import LogoPng from '../../../public/logo.svg'

type NavItemType = {
  title: string
  url: string
  icon?: Icon,
  selected?: boolean,
  visible?: boolean
}

export function SiteHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  const { wallet } = useWallet()

  const [status, setStatus] = useState<undefined | { status: string, active: boolean }>({ status: 'operational', active: true })
  const [sparkAddress, setSparkAddress] = useState("")

  const [menuItems, setMenuItems] = useState<NavItemType[]>([
    {
      title: 'Dashboard',
      url: '/app/dashboard',
      visible: true,
      selected: true,
      icon: IconDashboard
    }
  ])

  useEffect(() => {
    setMenuItems(menuItems.map(menu => {
      menu.selected = menu.url == location.pathname
      return menu
    }))
  }, [location])

  useEffect(() => {
    if (wallet) {
      wallet.getSparkAddress().then(setSparkAddress)
      wallet.sparkStatus().then(setStatus)
    } sparkAddress
  }, [wallet])

  const logout = () => {
    localStorage.removeItem('LOP_MNEMONIC')
    localStorage.removeItem('LOP_SESSION_TOKEN')
    localStorage.removeItem('LOP_SESSION_EXPIRES_AT')
    navigate('/', { replace: true })
  }

  const [open, setOpen] = useState(false)

  return (
    <header className="flex px-5 lg:px-10 h-15 shrink-0 items-center gap-2 border-b border-primary/80 border-b-5 bg-white">
      <div className="flex w-full items-center gap-1">
        <div className="flex justify-between items-center w-full">
          <div className='flex gap-5'>
            <h1 className="">
              <Link to='/app'>
                <div className='flex items-center gap-2 text-1xl'>
                  <img src={LogoPng} className='w-10' />
                  <div className='font-serif text-2xl tracking-tight text-foreground flex items-center'>
                    <span className='text-primary'>Tx</span>
                    <span className=''>Loop</span>
                  </div>
                </div>
              </Link>
            </h1>
            <nav className="flex gap-4 text-sm items-center">
              {menuItems.filter(i => i.visible).map((item: NavItemType, index: number) => (
                <div onClick={() => navigate(item.url)} key={index} className={`flex ${item.selected ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'} cursor-pointer items-center gap-1`} >
                  {item.icon && <item.icon className="h-5" />}
                  <span>{item.title}</span>
                </div>
              ))}
            </nav>
          </div>
          {wallet &&
            <div>
              <div className="flex text-xs items-center gap-2 text-gray-500 hidden sm:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className="text-xs rounded-full">{shortenAddress(sparkAddress)} <MoreVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator /> */}
                    <DropdownMenuItem className="text-xs focus:text-primary focus:bg-primary/10 h-8" onClick={logout} >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {status &&
                  <Tooltip>
                    <TooltipTrigger><div className={`${status.active ? 'bg-green-400' : 'bg-primary'} rounded-full w-2 h-2`}></div></TooltipTrigger>
                    <TooltipContent className="flex flex-col gap-2">
                      <p>Connected to Spark</p>
                      <p>Status: {status.status}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              </div>

              <div className="sm:hidden w-full">
                <Collapsible open={open} onOpenChange={setOpen}>
                  <CollapsibleTrigger asChild>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="absolute top-12 p-5 right-0 border rounded-md flex flex-col gap-5 bg-white border-primary/20 text-xs">
                    <p className="text-primary">{shortenAddress(sparkAddress)}</p>

                    <button
                      onClick={logout}
                      className="w-full text-left hover:bg-primary/10"
                    >
                      Logout
                    </button>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          }
        </div>
      </div >
    </header >
  )
}

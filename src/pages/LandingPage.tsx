import { ArrowRight, Bitcoin, CheckCircle2, Coins, Handshake, Lock, ReceiptText, Shield, Sparkles, TrendingUp, Workflow } from 'lucide-react'
import { Badge } from '../components/ui/badge.tsx'
import { Button } from '../components/ui/button.tsx'
import { Logo } from '../components/logo.tsx'
import { useNavigate } from 'react-router'

import ScreenPayment from '../../public/screen_payment.png'

export const LandingPage = () => {
  const navigate = useNavigate()
  return (
    <div className='w-full flex flex-col'>
      <header className="flex items-center gap-2 border-b h-15 bg-white fixed w-full z-100">
        <div className="flex w-full items-center gap-1 lg:gap-2 px-5 lg:px-30">
          <div className="flex justify-between items-center w-full">
            <div className='flex items-center gap-5 text-2xl'>
              <Logo />
            </div>
            <div>
              <Button onClick={() => navigate('/app')}>Launch the app</Button>
            </div>
          </div>
        </div>
      </header>
      <div className='flex flex-col '>
        <div className='flex flex-col gap-10 px-5 lg:px-30 py-20 lg:py-20 bg-primary/5'>
          <div>
            <Badge className='gap-2 bg-primary/10 text-primary text-sm px-4 py-2 border-primary/20 rounded-full font-light font-medium'>
              <Sparkles className="h-4 w-4" />
              <span>Built on Bitcoin</span>
            </Badge>
          </div>
          <div className='font-semibold lg:w-1/2'>
            <h1 className='text-7xl text-slate-900'><span className='text-primary'>Tokenize</span> completed work.</h1>
            <h2 className='text-5xl'>Build <span className='text-primary'>repeat business.</span></h2>
          </div>
          <div className='flex flex-col gap-5'>
            <h3 className='text-slate-500 text-2xl font-light'>Issue Bitcoin-anchored work receipts after you get paid. <br />Clients redeem them for discounts on future projects.</h3>
            <div className='flex flex-col text-sm text-gray-500 gap-3'>
              <p className='flex items-center gap-2'><CheckCircle2 className='h-5' /> No custody, no processors</p>
              <p className='flex items-center gap-2'><CheckCircle2 className='h-5' /> <span>Just <span className='text-primary'>proof of work</span> that compounds into loyalty</span></p>
            </div>
          </div>
          <div className='flex flex-col gap-2 lg:flex-row'>
            <Button onClick={() => navigate('/app')} className='p-6'>Create your first receipt <ArrowRight /></Button>
          </div>
        </div>
        <div className='flex flex-col gap-30 px-5 lg:px-30 py-10 lg:py-20 border-t border-primary/10 bg-slate-50'>
          <div className='flex flex-col gap-5 pb-10 pt-10'>
            <div className='flex lg:flex-row flex-col gap-20 '>
              <div className='flex flex-col gap-10 w-full '>
                <p className='text-4xl font-semibold text-slate-600'>Most loyalty systems reward spending.</p>
                <div className='flex flex-col gap-10'>
                  <div className='flex flex-col gap-1 text-xl text-slate-500'>
                    <p>Traditional loyalty platforms issue points disconnected from real value.</p>
                    <p>Crypto loyalty often turns into speculation.</p>
                  </div>
                  <p className='text-3xl font-bold text-primary'>Work deserves better.</p>
                </div>
              </div>
              <div className='flex flex-col gap-5 lg:gap-18 w-full'>
                <p className='flex text-4xl gap-2 font-semibold text-slate-600'>How this is different ?</p>
                <div className='flex flex-col gap-5'>
                  <p className='text-2xl font-semibold bg-white p-5 shadow-lg rounded-lg'>Tokens are minted only when <span className='text-primary'>real work is delivered and paid.</span></p>
                  <p className='text-2xl font-semibold bg-white p-5 shadow-lg rounded-lg'>Their value comes from <span className='text-primary font-semibold'>trust</span>, not hype.</p>
                </div>
              </div>
            </div>
          </div>
          {/* <div className='flex flex-col lg:flex-row gap-10 justify-between'>
            <div className="border-b pb-10 lg:border-r lg:border-b-0 lg:pb-0 border-primary/20">
              <div className="">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-slate-600 mt-6 text-xl">Proof of Work → Proof of Loyalty</h3>
                <p className="text-slate-400 leading-relaxed mt-3 font-light">
                  Turn completed projects into verifiable on-chain receipts. Reward repeat clients with tradable tokens.
                </p>
              </div>
            </div>
            <div className="">
              <div className="border-b pb-10 lg:border-r lg:border-b-0 lg:pb-0 border-primary/20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="font-display text-slate-600 mt-6 text-xl">Self-Custody or Full Automation</h3>
                <p className="text-slate-400 leading-relaxed mt-3 font-light">
                  Turn completed projects into verifiable on-chain receipts. Reward repeat clients with tradable tokens.
                </p>
              </div>
            </div>
            <div className="">
              <div className="">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary">
                  <Workflow className="h-8 w-8" />
                </div>
                <h3 className="font-display text-slate-600 mt-6 text-xl">Built for teams</h3>
                <p className="text-slate-400 leading-relaxed mt-3 font-light">
                  Seamless integrations with your billing tools, project trackers, and payment systems. No crypto expertise required.
                </p>
              </div>
            </div>
          </div> */}

        </div>

        <div className='flex flex-col justify-between gap-20 lg:gap-30 px-5 lg:px-30 py-15 lg:py-30 relative border-t border-primary/10'>
          <div
            className='absolute inset-50
            h-100
            [background-size:10px_10px]
            [background-image:radial-gradient(#f5f5f5_1px,transparent_1px)]
            '
          />
          <div className='flex flex-1 justify-center z-20'>
            <div className='flex flex-col gap-5 text-center'>
              <h2 className='text-5xl font-bold'>The Loop Of Work</h2>
              <p className='text-2xl text-slate-400 '>From payment to loyalty: <span className='text-primary'>four</span> steps. <span className='text-primary'>One</span> continuous loop.</p>
            </div>
          </div>
          <div className='flex flex-col lg:flex-row gap-10 lg:gap-5 relative justify-center'>
            <div className="flex flex-col items-center text-center space-y-6 w-100">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 blur-2xl rounded-full group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/40 border-primary/40 border-1 text-accent-foreground font-display text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
              </div>
              <Coins className="h-10 w-10 text-primary/80" />
              <div className="space-y-3">
                <h4 className="font-display text-xl text-foreground">Get paid</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  Create a payment request and share it with your client.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-6 w-100">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 blur-2xl rounded-full group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/40 border-primary/30 border-1 text-accent-foreground font-display text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
              </div>
              <ReceiptText className="h-10 w-10 text-primary/80" />
              <div className="space-y-3">
                <h4 className="font-display text-xl text-foreground">Issue a receipt</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  Once payment is confirmed, mint a work receipt token to your client’s wallet.
                </p>
              </div>

            </div>
            <div className="flex flex-col items-center text-center space-y-6 w-100">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 blur-2xl rounded-full group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/40 border-primary/30 border-1 text-accent-foreground font-display text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
              </div>
              <Handshake className="h-10 w-10 text-primary/80" />
              <div className="space-y-3">
                <h4 className="font-display text-xl text-foreground">Build loyalty</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  Each receipt represents completed work and earned trust.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-6 w-100">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 blur-2xl rounded-full group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/40 border-primary/30 border-1 text-accent-foreground font-display text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  4
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-primary/80" />
              <div className="space-y-3">
                <h4 className="font-display text-xl text-foreground">Redeem for discounts</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  Clients redeem receipts for discounts on future projects — reinforcing long-term collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col  px-5 lg:px-30 py-15 lg:py-30 gap-10 lg:gap-20 border-t border-primary/10'>
          <div className='flex flex-col gap-5 text-center'>
            <h2 className='text-5xl font-bold'><span className='text-primary'>Operational work,</span> not speculation</h2>
            <p className='text-2xl text-slate-400 '>Our tokens are not financial instruments. </p>
          </div>
          <div className='flex justify-center'>
            <div className='flex flex-col gap-2'>
              <p className='text-3xl'>They are <strong className='text-primary'>operational receipts:</strong></p>
              <div className='flex lg:flex-row flex-col gap-5 mt-10'>
                <div className='flex gap-5 bg-primary/5 border-1 border-primary/10 p-5 rounded-lg font-semibold items-center'>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 text-primary">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-slate-600 text-xl">Proof that work was completed</h3>
                </div>
                <div className='flex gap-5 bg-primary/5 border-1 border-primary/10 p-5 rounded-lg font-semibold items-center'>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 text-primary">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-slate-600 text-xl">Proof that value was delivered</h3>
                </div>
                <div className='flex gap-5 bg-primary/5 border-1 border-primary/10 p-5 rounded-lg font-semibold items-center'>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 text-primary">
                    <Workflow className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-slate-600 text-xl">Proof that trust was earned</h3>
                </div>
              </div>
              <p className='mt-10 text-2xl text-center'>This is <span className='text-primary font-semibold'>Operational Real-World Assets (oRWA)</span> — <br />grounded in real business activity.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-10 px-5 lg:px-30 py-15 lg:py-30 bg-gray-50'>
          <div className='flex flex-col gap-10 items-center'>
            <div className='flex gap-10'>
              <Shield className='w-8 h-8 text-primary' />
              <Lock className='w-8 h-8 text-primary' />
              <Bitcoin className='w-8 h-8 text-primary' />
            </div>
            <h3 className='text-5xl font-bold text-center'><span className='text-primary'>Your</span> keys. <span className='text-primary'>Your</span> clients. <span className='text-primary'>Your</span> business.</h3>
            <h4 className='text-gray-500 text-xl text-center'>Assets are secured by Bitcoin's network.</h4>
          </div>
          <div className='flex justify-center mt-10'>
            <div className='flex flex-col gap-10'>

              <div className='flex lg:flex-row flex-col gap-5'>
                <div className='lg:w-1/2 bg-white shadow-lg flex flex-col gap-5 text-left p-10 border-1 border-gray-100 rounded-lg'>
                  <p className='text-2xl font-bold'>With a <span className='text-primary '>self-custodial</span>, you remaing in control with total ownership.</p>
                  <p className='text-slate-500 flex items-center gap-2'><CheckCircle2 className='h-5 text-primary' /> <span>Secured by a passphrase only known by you.</span></p>
                  <p className='text-slate-500 flex items-center gap-2'><CheckCircle2 className='h-5 text-primary' /> <span>Once created, receipts tokens are associated to your wallet.</span></p>
                  <p className='text-slate-500 flex items-center gap-2'><CheckCircle2 className='h-5 text-primary' /> <span>We don't and we <strong>can't have access</strong> to your funds.</span></p>
                </div>
                <div className='w-/12 border-1 border-primary/20 flex items-center rounded-lg p-10 bg-primary/10'>
                  <p className='font-bold text-3xl'>You remain the <span className='text-primary'>sole owner</span> of your assets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col justify-between gap-10 px-5 lg:px-30 py-10 lg:py-30'>
          <div className='flex flex-col gap-5 text-center'>
            <h2 className='text-5xl font-bold text-black'>Pay only when you activate checkout</h2>
            <p className=' text-gray-400 '>Creating receipts is free. </p>
          </div>
          <div className='flex justify-center'>

            <div className='flex flex-col gap-10'>

              <div className='flex flex-col gap-10 p-10 border-1 border-primary/20 bg-primary/5 shadow-xl rounded-lg'>
                <div className='flex lg:flex-row flex-col items-center gap-10'>
                  <div className='flex flex-col gap-5 lg:w-1/2'>
                    <p className='text-5xl font-bold'><span className='text-primary'>~$1</span> in sats</p>
                    <p className='text-xl'>Per checkout activation</p>
                    <p className='text-slate-500 text-center'>Provide a checkout page that allows clients to use redeemable tokens for discounts.</p>
                  </div>
                  <img src={ScreenPayment} className='shadow-xl rounded-lg w-100' />
                </div>
                <div className='flex lg:flex-row flex-col flex p-2 justify-center mt-10 gap-2'>
                  <p className='bg-white text-primary border-1 border-primary/20 rounded-full pt-2 pb-2 pl-4 pr-4'>No subscription required</p>
                  <p className='bg-white text-primary border-1 border-primary/20 rounded-full pt-2 pb-2 pl-4 pr-4'>No processor fee</p>
                  <p className='bg-white text-primary border-1 border-primary/20 rounded-full pt-2 pb-2 pl-4 pr-4'>No custody of funds</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className='flex flex-col justify-between gap-10 px-5 lg:px-30 py-15 lg:py-30 items-center bg-primary/5 border-top border-bottom border-1 border-primary/20 '>
          <h2 className='text-6xl font-semibold text-center'>Turn completed work into <br /><span className='text-primary'>lasting</span> relationships</h2>
          <p className='text-gray-400 text-xl'>Start issuing work receipts and let loyalty grow naturally.</p>
          <div className='flex flex-col lg:flex-row gap-5 w-full justify-center'>
            <Button className='px-5 py-6 text-lg' onClick={() => navigate('/app')}>Get started <ArrowRight /></Button>
          </div>
        </div>
        <div className='flex lg:flex-row flex-col gap-10 px-5 lg:px-30 py-5 lg:py-10 justify-between '>
          <div className='flex flex-col'>
            <Logo />
          </div>
          <p className='text-sm text-gray-500'>
            Designed by <a href='https://hexquarter.com' target='_blank' className='font-bold'>HexQuarter</a>
            <br /> Built on <strong><a href='https://spark.money/' target='_blank'>Spark</a></strong>.
            Powered by <strong><a href='https://breez.technology/' target='_blank'>Breez</a></strong>.
            <br />Backed by <strong className='text-primary'>Bitcoin</strong>
          </p>
        </div>
      </div >
    </div>
  )
}
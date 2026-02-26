import LogoPng from '../../../public/logo.svg'


export function Footer() {
    return (
        <footer className="border-t border-border/40 px-6 py-16 sm:px-10 md:py-20 lg:px-16">
            <div className="mx-auto flex max-w-[90rem] flex-col gap-10 md:flex-row md:items-center md:justify-between">
                <a href="#" className="font-serif text-xl tracking-tight text-foreground flex items-center gap-2">
                    <img src={LogoPng} className='w-5' />
                    <span><span className="text-primary">bit</span>lasso</span>
                </a>

                <div className="flex items-center gap-10">
                    {["Documentation", "GitHub", "Contact"].map((label) => (
                        <a
                            key={label}
                            href="#"
                            className="text-[13px] tracking-wide text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
                        >
                            {label}
                        </a>
                    ))}
                </div>

                <div className='flex flex-col gap-1'>
                    <p className="text-[13px] tracking-wide text-muted-foreground/35">
                        Built on Bitcoin.
                    </p>
                    <p className="text-[13px] tracking-wide text-muted-foreground/35">Designed by <a href='https://hexquarter.com' className="font-bold text-muted-accent hover:text-primary" target='_blank'>HexQuarter</a></p>
                    <p className="text-[13px] tracking-wide text-muted-foreground/35">Powered by <a href='https://breez.technology' className="font-bold text-muted-accent hover:text-primary" target='_blank'>Breez</a></p>
                </div>
            </div>
        </footer>
    )
}

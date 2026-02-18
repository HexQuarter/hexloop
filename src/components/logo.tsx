import LogoPng from '../../public/logo.svg'

export const Logo = () => {
    return (
        <div className='font-bold flex items-center flex gap-2 text-3xl'>
            <img src={LogoPng} className='w-10' />
            <div className='font-[Unbounded] font-light'>
                <span className='text-primary'>hex</span>
                <span className=''>loop</span>
            </div>
        </div>
    )
}
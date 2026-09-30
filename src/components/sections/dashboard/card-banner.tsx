import Image from 'next/image';

export default function CardBanner() {
    return (
        <div className="bg-[#d3d6df] bg-[url('/images/bg_banner_dashboard.png')] bg-no-repeat bg-cover bg-right-bottom min-h-[18rem] md:min-h-min rounded-2xl h-full p-4 pt-6 flex flex-col gap-2">
            <Image
                src="/images/logo_autopilot_dark.svg"
                alt="AutoPilot"
                width={163}
                height={33}
            />
            <span className="block text-[#1B263A] text-[1.25rem] leading-6 max-w-[163px]">
                seu piloto de vendas.
            </span>
            <span className="block text-[#636885] text-[.875rem] max-w-[163px] leading-4">
                Vivamus bibendum sit amet eros.
            </span>
        </div>
    );
}

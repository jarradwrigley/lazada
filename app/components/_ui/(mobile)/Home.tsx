import { Grip, Headset, ScanLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import InfiniteImageSlider from "../../SnapSlider";


export default function MobileHomePage() {

    const photos = [
      { url: "/images/promo1.jpg", alt: "Slide 1" },
      { url: "/images/promo2.png", alt: "Slide 2" },
      { url: "/images/promo3.jpg", alt: "Slide 3" },
    ];
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed header */}
        <header className="fixed top-0 left-0 right-0 z-10 bg-gray-50 flex justify-between items-center py-2 px-4 border-b border-gray-100">
          <button className="active:opacity-50 transition-opacity">
            <Grip size={24} />
          </button>

          <div className="flex items-center gap-4">
            <button className="active:opacity-50 transition-opacity">
              <ScanLine size={24} />
            </button>
            <button className="active:opacity-50 transition-opacity">
              <Headset size={24} />
            </button>
          </div>
        </header>

        {/* Scrollable content with padding-top to account for fixed header */}
        <div className="pt-14 px-4 overflow-y-auto">
          <div className="my-4">
            <InfiniteImageSlider images={photos} />
          </div>

          <div className="mb-4 flex items-center justify-center ">
            <p className="text-2xl font-[600] text-center">
              Join SOLEX to claim 300 USDT from newbie rewards
            </p>
          </div>

          <Link href="/login">
            <button className="active:opacity-50 transition-opacity mb-6 flex items-center justify-center py-4 bg-black text-white w-full rounded-full">
              <span className="leading-[24px] font-[600] text-[18px]">
                Log in/Sign up
              </span>
            </button>
          </Link>

          <div className="grid grid-cols-2 grid-rows-3 gap-4 h-76 mb-6">
            <button className="active:opacity-50 transition-opacity rounded-[12px] border border-gray-300 p-3 col-start-1 row-span-3 flex flex-col justify-between">
              <span className="text-left w-[90%] text-xl font-[550]">
                Top-tier liquidity, security, and stability
              </span>
              <div className="w-full flex flex-col items-start">
                <div className="flex flex-col items-start">
                  <span className="text-gray-700 text-md">Reserve fund</span>
                  <span className="font-[600] ">1,000 BTC</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-700 text-md">24h Volume</span>
                  <span className="font-[600] ">$28,942,453,169</span>
                </div>
              </div>
            </button>

            <button className="active:opacity-50 transition-opacity relative rounded-[12px] border border-gray-300 p-3 col-start-2 row-span-2 flex items-center justify-center">
              <Image
                className="absolute top-[0%] left-[0%]"
                src="/images/stack.png"
                width={80}
                height={80}
                alt="earn"
              />
              <span className="text-xl text-left">Commit WXT and earn!</span>
            </button>

            <button className="active:opacity-50 overflow-hidden transition-opacity relative rounded-[12px] border border-gray-300 col-start-2 row-start-3 flex items-center justify-center">
              <Image
                className="absolute bottom-[-15%] right-[0%]"
                src="/images/zone.png"
                width={90}
                height={90}
                alt="earn"
              />
              <span className="text-xl ">SOLANA Zone</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
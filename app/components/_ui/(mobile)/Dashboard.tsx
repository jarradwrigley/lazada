import { Grip, Headset, ScanLine } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function MobileDashboardPage() {
  const handleLogout = async () => {
    await signOut({
      redirect: true,
      redirectTo: "/login",
    });
  };
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-gray-50 flex justify-between items-center py-2 px-4">
        <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50">
          <Grip size={24} />
        </button>

        <div className="flex items-center gap-4">
          <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50">
            <ScanLine size={24} />
          </button>
          <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50">
            <Headset size={24} />
          </button>
        </div>
      </header>

      <div className=" pt-14 pb-4 gap-5 flex flex-col min-h-[100dvh] overflow-y-auto">
        <div id="promo" className="px-4">
          <div className="bg-gray-200 rounded-[1.5rem] p-4 flex flex-col gap-2 ">
            <span className="font-bold text-xl ">New users only</span>
            <span className="font-extralight">Get 300 USDT signal</span>
            <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50 bg-black w-full flex items-center justify-center py-3 rounded-[3rem]">
              <span className="text-white text-lg font-medium">Deposit</span>
            </button>
          </div>
        </div>

        <div id="buttons" className="px-4">
          <div className="flex items-center justify-between px-[1rem]">
            <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50 ">
              <div className="flex flex-col gap-2 items-center">
                <Image
                  src="/images/gift.svg"
                  alt="gift"
                  width={25}
                  height={25}
                />

                <span className="text-xs ">Rewards</span>
              </div>
            </button>

            <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50 ">
              <div className="flex flex-col gap-2 items-center">
                <Image
                  src="/images/user-plus.svg"
                  alt="gift"
                  width={25}
                  height={25}
                />

                <span className="text-xs">Referral</span>
              </div>
            </button>

            <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50 ">
              <div className="flex flex-col gap-2 items-center">
                <Image
                  src="/images/deposit.svg"
                  alt="gift"
                  width={25}
                  height={25}
                />

                <span className="text-xs">Deposit</span>
              </div>
            </button>

            <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50 ">
              <div className="flex flex-col gap-2 items-center">
                <Image
                  src="/images/receive.svg"
                  alt="gift"
                  width={25}
                  height={25}
                />

                <span className="text-xs">Receive</span>
              </div>
            </button>

            <button className="active:scale-102 active:opacity-80 transition-opacity disabled:opacity-50 ">
              <div className="flex flex-col gap-2 items-center">
                <Image
                  src="/images/trophy.svg"
                  alt="gift"
                  width={25}
                  height={25}
                />

                <span className="text-xs">Compete</span>
              </div>
            </button>
          </div>
        </div>

        <button className="bg-red-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

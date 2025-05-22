"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, User, Settings, Search, Bell, LogOut, ChartCandlestick, ScrollText } from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
  },
  {
    href: "/market",
    label: "Market",
    icon: ChartCandlestick,
  },
  {
    href: "/futures",
    label: "Futures",
    icon: ScrollText,
  },
  {
    href: "/spot",
    label: "Spot",
    icon: Settings,
  },
  {
    href: "/assets",
    label: "Assets",
    icon: User,
  },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="flex justify-around items-center px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col active:scale-102 active:opacity-80 transition-opacity items-center justify-center px-2 py-1 rounded-lg transition-colors ${
                active
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                size={20}
                className={active ? "text-black font-bold" : "text-gray-500"}
              />
              <span
                className={`text-xs mt-1 ${
                  active ? "text-black font-bold" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Optional: Add logout button */}
        {/* <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-gray-500 hover:text-red-600 hover:bg-red-50"
          title="Sign Out"
        >
          <LogOut size={20} />
          <span className="text-xs mt-1">Logout</span>
        </button> */}
      </div>

      {/* Optional: Display user info
      {session?.user && (
        <div className="text-center py-1 text-xs text-gray-500 border-t border-gray-100">
          Welcome, {session.user.name || session.user.email}
        </div>
      )} */}
    </nav>
  );
}

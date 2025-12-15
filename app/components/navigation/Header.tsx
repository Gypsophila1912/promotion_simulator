"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import HeaderNav from "./PcMenu";
import MenuButton from "./MenuButton";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const pathname = usePathname();

  // ヘッダーを出したくないパス
  if (pathname === "/auth/login" || pathname === "/auth/signup") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold">
          MyApp
        </Link>

        <HeaderNav />

        <div className="flex items-center gap-2">
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
            >
              ログアウト
            </button>
          </form>
          <MenuButton />
        </div>
      </div>

      <MobileMenu />
    </header>
  );
}

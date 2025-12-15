// components/navigation/Header.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import HeaderNav from "./PcMenu";
import MenuButton from "./MenuButton";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold">
          MyApp
        </Link>

        <HeaderNav />

        <div className="flex items-center gap-2">
          <form action={signOut}>
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

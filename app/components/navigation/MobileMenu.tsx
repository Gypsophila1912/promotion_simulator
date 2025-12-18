// components/navigation/MobileMenu.tsx
"use client";

import Link from "next/link";
import { useMenuStore } from "./menuStore";

export default function MobileMenu() {
  const open = useMenuStore((state) => state.open);
  const close = useMenuStore((state) => state.close);

  if (!open) return null;

  return (
    <div className="md:hidden border-t bg-white">
      <nav className="flex flex-col p-4 gap-4">
        <Link href="/dashboard" onClick={close}>
          ダッシュボード
        </Link>
        <Link href="/simulations" onClick={close}>
          シミュレーション
        </Link>
        <Link href="/reviews" onClick={close}>
          口コミ
        </Link>
      </nav>
    </div>
  );
}

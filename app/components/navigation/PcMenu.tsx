import Link from "next/link";

export default function HeaderNav() {
  return (
    <nav className="hidden md:flex gap-6 text-sm">
      <Link href="/dashboard">ダッシュボード</Link>
      <Link href="/reviews">口コミ</Link>
      <Link href="/home">ホーム</Link>
    </nav>
  );
}

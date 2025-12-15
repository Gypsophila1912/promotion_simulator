// components/navigation/MenuButton.tsx
"use client";

import { useMenuStore } from "./menuStore";

export default function MenuButton() {
  const toggle = useMenuStore((state) => state.toggle);

  return (
    <button
      onClick={toggle}
      aria-label="menu"
      className="
    p-2
    rounded-md
    border
    border-gray-300
    hover:bg-gray-100
    active:bg-gray-200
    transition
    md:hidden
  "
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

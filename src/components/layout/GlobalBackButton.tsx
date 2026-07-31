"use client";

import { useRouter, usePathname } from "next/navigation";

export function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on the root dashboard page to avoid confusion
  if (pathname === "/") return null;

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Go Back
    </button>
  );
}

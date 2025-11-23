"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function NavbarConditional() {
  const pathname = usePathname();

  // Show navbar only on public pages, not on authenticated sections
  const publicRoutes = ['/', '/profil', '/galeri', '/unduh-materi', '/kontak', '/edukasi'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (!isPublicRoute) {
    return null;
  }

  return <Navbar />;
}
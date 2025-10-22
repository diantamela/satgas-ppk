"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Semua Laporan",
      url: "/dashboard/laporan",
      icon: IconReport,
    },
    {
      title: "Investigasi",
      url: "/dashboard/investigasi",
      icon: IconListDetails,
    },
    {
      title: "Rekomendasi",
      url: "/dashboard/rekomendasi",
      icon: IconFileDescription,
    },
  ],
  navSecondary: [
    {
      title: "Anggota Satgas",
      url: "/dashboard/anggota",
      icon: IconUsers,
    },
    {
      title: "Dokumen",
      url: "/dashboard/dokumen",
      icon: IconDatabase,
    },
    {
      title: "Notifikasi",
      url: "/dashboard/notifikasi",
      icon: IconNotification,
    },
    {
      title: "Pengaturan",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  navRektor: [
    {
      title: "Dashboard Rektor",
      url: "/dashboard/rektor",
      icon: IconDashboard,
    },
    {
      title: "Laporan Akhir",
      url: "/dashboard/rektor/laporan-akhir",
      icon: IconReport,
    },
    {
      title: "Rekomendasi",
      url: "/dashboard/rektor/rekomendasi",
      icon: IconFileDescription,
    },
  ],
  navUser: [
    {
      title: "Beranda",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Laporkan Kasus",
      url: "/laporkan-kasus",
      icon: IconReport,
    },
    {
      title: "Cek Status",
      url: "/cek-status",
      icon: IconSearch,
    },
    {
      title: "Edukasi",
      url: "/edukasi",
      icon: IconFileAi,
    },
    {
      title: "Tentang Kami",
      url: "/tentang",
      icon: IconFolder,
    },
    {
      title: "Kontak",
      url: "/kontak",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com", 
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src="/codeguide-logo.png" alt="CodeGuide" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">Satgas PPK</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Show different navigation based on user role */}
        {session?.user?.role === 'rektor' ? (
          <>
            <NavMain items={staticData.navRektor} />
          </>
        ) : session?.user?.role === 'satgas' ? (
          <>
            <NavMain items={staticData.navMain} />
            <NavSecondary items={staticData.navSecondary} className="mt-auto" />
          </>
        ) : (
          <>
            <NavMain items={staticData.navUser} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

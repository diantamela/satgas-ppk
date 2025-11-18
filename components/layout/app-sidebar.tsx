"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
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
  IconBell,
  IconHome,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/navigation/nav-documents";
import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/satgas/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Semua Laporan",
      url: "/satgas/dashboard/laporan",
      icon: IconReport,
    },
    {
      title: "Investigasi",
      url: "/satgas/dashboard/investigasi",
      icon: IconListDetails,
    },
    {
      title: "Gallery",
      url: "/satgas/dashboard/rekomendasi",
      icon: IconFileDescription,
    },
    {
      title: "Anggota Satgas",
      url: "/satgas/dashboard/anggota",
      icon: IconUsers,
    },
    {
      title: "Dokumen",
      url: "/satgas/dashboard/dokumen",
      icon: IconDatabase,
    },
    {
      title: "Notifikasi",
      url: "/satgas/dashboard/notifikasi",
      icon: IconBell,
    },
    {
      title: "Pengaturan",
      url: "/satgas/dashboard/settings",
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
      title: "Dashboard",
      url: "/user/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Laporkan Kasus",
      url: "/user/laporkan-kasus",
      icon: IconReport,
    },
    {
      title: "Cek Status",
      url: "/user/cek-status",
      icon: IconSearch,
    },
    {
      title: "Pengaturan",
      url: "/user/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email,
        avatar: "/codeguide-logo.png",
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/codeguide-logo.png",
      };

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
                <span className="text-base font-semibold font-parkinsans">Satgas PPK</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Show different navigation based on user role */}
        {(session as any)?.user?.role === 'REKTOR' ? (
          <NavMain items={staticData.navRektor} />
        ) : (session as any)?.user?.role === 'SATGAS' ? (
          <NavMain items={staticData.navMain} />
        ) : (
          <NavMain items={staticData.navUser} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

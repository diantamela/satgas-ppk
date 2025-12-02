"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import {
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBell,
  IconChevronLeft,
  IconChevronRight,
  IconActivity,
  IconMessageCircle,
  IconCalendar,
} from "@tabler/icons-react";

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
import { useSidebar } from "@/components/ui/sidebar";

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/satgas/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Aktivitas",
      url: "/satgas/dashboard/aktivitas",
      icon: IconActivity,
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
      title: "Penjadwalan",
      url: "/satgas/dashboard/penjadwalan",
      icon: IconCalendar,
    },
    {
      title: "Rekomendasi",
      url: "/satgas/dashboard/rekomendasi",
      icon: IconFileDescription,
    },
    {
      title: "Gallery",
      url: "/satgas/dashboard/gallery",
      icon: IconDatabase,
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
      title: "Konsultasi",
      url: "/satgas/dashboard/konsultasi",
      icon: IconMessageCircle,
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
      url: "/rektor/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Laporan Akhir",
      url: "/rektor/dashboard/laporan-akhir",
      icon: IconReport,
    },
    {
      title: "Rekomendasi",
      url: "/rektor/dashboard/rekomendasi",
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
  const { state, toggleSidebar } = useSidebar();

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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1"
              >
                <Link href="/">
                  <span className="text-base font-semibold font-inter">Satgas PPK</span>
                </Link>
              </SidebarMenuButton>
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
              >
                {state === "expanded" ? (
                  <IconChevronLeft className="w-4 h-4" />
                ) : (
                  <IconChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
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

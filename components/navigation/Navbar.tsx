"use client";

import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, Menu, Shield } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { SimpleThemeToggle } from "@/components/layout/theme-toggle";

// =======================================================
// Komponen Dasar & Helper Mandiri
// =======================================================

interface CustomButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: string;
  size?: string;
  className?: string;
  [key: string]: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]";
  const sizeStyles =
    size === "lg" ? "px-7 py-2 text-lg" : "px-4 py-1.5 text-sm";

  let variantStyles;

  if (variant === "primary" || variant === "default") {
    variantStyles =
      "bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-500/50 border border-red-700";
  } else if (variant === "outline") {
    variantStyles =
      "bg-transparent border border-red-600 text-red-700 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700";
  } else if (variant === "ghost") {
    variantStyles =
      "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent";
  } else if (variant === "link") {
    variantStyles =
      "bg-transparent text-red-600 dark:text-red-400 font-bold hover:no-underline p-0 h-auto";
  } else {
    variantStyles =
      "bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-500/50 border border-red-700";
  }

  const Element: any = href ? "a" : "button";
  const linkProps = href ? { href } : {};

  return (
    <Element
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...linkProps}
      {...props}
    >
      {children}
    </Element>
  );
};


const AuthButtons = ({ session }: { session: any }) => {
  return (
    <>
      <CustomButton
        variant="ghost"
        size="sm"
        href="/sign-in"
        className="flex items-center"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </CustomButton>
      <CustomButton
        variant="primary"
        size="sm"
        href="/sign-up"
        className="flex items-center"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Sign Up
      </CustomButton>
    </>
  );
};

export const Navbar = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("menuOpen") === "true";
    setMenuOpen(stored);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("menuOpen", menuOpen.toString());
    }
  }, [menuOpen, mounted]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100/70 dark:border-gray-800/70 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center space-x-2 font-extrabold text-xl text-red-700 dark:text-red-400 hover:text-red-600 transition"
        >
          <Shield className="w-6 h-6 fill-red-200 dark:fill-red-900" />
          <span>SATGAS PPK</span>
        </a>

        {/* Tombol Menu Mobile */}
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </CustomButton>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <CustomButton
            variant="ghost"
            size="sm"
            href="/profil"
            className="text-sm"
          >
            Profil
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="sm"
            href="/galeri"
            className="text-sm"
          >
            Berita Kegiatan
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="sm"
            href="/unduh-materi"
            className="text-sm"
          >
            Unduh Materi
          </CustomButton>

          <AuthButtons session={session} />
          <SimpleThemeToggle />
        </div>
      </div>

      {/* Menu Mobile (header tetap, menu muncul di bawahnya) */}
      {mounted && menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100/70 dark:border-gray-800/70 shadow-md">
          <div className="container mx-auto max-w-7xl px-6 py-3 flex flex-col gap-2">
            <CustomButton
              variant="ghost"
              size="sm"
              href="/profil"
              className="text-sm w-full justify-start"
              onClick={closeMenu}
            >
              Profil
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              href="/galeri"
              className="text-sm w-full justify-start"
              onClick={closeMenu}
            >
              Berita Kegiatan
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              href="/unduh-materi"
              className="text-sm w-full justify-start"
              onClick={closeMenu}
            >
              Unduh Materi
            </CustomButton>

            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <AuthButtons session={session} />
              <SimpleThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
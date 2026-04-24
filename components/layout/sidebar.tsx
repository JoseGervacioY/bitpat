"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  collapsed, 
  onToggle, 
  isMobileOpen = false, 
  onCloseMobile 
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    {
      href: "/home",
      label: t.nav.home,
      icon: Home,
    },
    {
      href: "/dashboard",
      label: t.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: "/market",
      label: t.nav.market,
      icon: TrendingUp,
    },
    {
      href: "/portfolio",
      label: t.nav.portfolio,
      icon: Wallet,
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out",
          // Desktop behavior
          !isMobileOpen && (collapsed ? "w-20" : "w-64"),
          // Mobile behavior
          "max-md:w-[70%] max-md:max-w-[300px]",
          isMobileOpen ? "translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div
            className={cn(
              "flex h-16 items-center border-b border-sidebar-border transition-all duration-300",
              collapsed ? "justify-center px-2" : "gap-3 px-6"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-primary/20">
              <Image src="/logo.png" alt="BITPAT Logo" width={40} height={40} className="object-cover" />
            </div>
            <span
              className={cn(
                "text-xl font-bold tracking-tight transition-all duration-300",
                collapsed ? "hidden" : "block"
              )}
            >
              BITPAT
            </span>
          </div>

          {/* Toggle button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-md hover:bg-sidebar-accent hidden md:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const NavLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                    collapsed
                      ? "justify-center p-3"
                      : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")}
                  />
                  <span
                    className={cn(
                      "transition-all duration-300",
                      collapsed ? "hidden" : "block"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return NavLink;
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-sidebar-border p-3 space-y-3">
            {/* Theme and Language switchers */}
            <div
              className={cn(
                "flex items-center",
                collapsed ? "flex-col gap-2" : "justify-between"
              )}
            >
              {collapsed ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ThemeSwitcher />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t.common.darkMode}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <LanguageSwitcher collapsed />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t.common.language}
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                </>
              )}
            </div>

            {/* User info and logout */}
            {user && (
              <div className="space-y-2">
                {!collapsed && (
                  <div className="rounded-xl bg-sidebar-accent/50 p-3">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t.nav.logout}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    {t.nav.logout}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

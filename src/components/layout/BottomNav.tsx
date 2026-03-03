// Bottom Navigation Bar — the tab bar at the bottom of the screen.
// Shows Feed, Map, Post, and Profile tabs with icons.
// Highlights the active tab based on the current URL.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the tabs — each has a URL, label, and icon component
const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/create", label: "Post", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname(); // Get the current URL path

  return (
    // Fixed to bottom, blurred glass-like background
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          // Check if this tab is the active one
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-brand-600"                    // Active: brand blue
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              <item.icon
                className={cn("h-6 w-6", isActive && "fill-brand-100")}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

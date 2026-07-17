"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useState } from "react";

export function DashboardHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || ""}
                width={32} height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium">
              {session?.user?.name?.split(" ")[0]}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card shadow-lg z-50 p-1 animate-fade-up">
              <p className="px-3 py-2 text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
              <hr className="my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

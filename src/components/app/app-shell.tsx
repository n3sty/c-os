"use client";

import {
  RiBillLine,
  RiDownloadLine,
  RiFileList3Line,
  RiInboxLine,
  RiReceiptLine,
  RiUser3Line,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Inbox", href: "/", icon: RiInboxLine },
  { label: "Clients", href: "/clients", icon: RiUser3Line },
  { label: "Proposals", href: "/proposals", icon: RiFileList3Line },
  { label: "Invoices", href: "/invoices", icon: RiBillLine },
  { label: "Expenses", href: "/expenses", icon: RiReceiptLine },
  { label: "Exports", href: "/exports", icon: RiDownloadLine },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-svh bg-background">
      <div className="flex min-h-svh w-full">
        <aside className="hidden w-58 shrink-0 bg-background px-3 py-4 text-foreground md:block">
          <div className="flex h-full flex-col">
            <div className="px-2 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-6 items-center justify-center rounded-md text-muted-foreground">
                  <RiInboxLine size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Coscience OS</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground",
                      active && "bg-muted/45 font-medium text-foreground",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <item.icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}

"use client";

import {
  RiAddLine,
  RiArchiveLine,
  RiBillLine,
  RiDownloadLine,
  RiFileList3Line,
  RiInboxLine,
  RiReceiptLine,
  RiSearchLine,
  RiUser3Line,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
        <aside className="hidden w-68 shrink-0 border-r bg-sidebar px-4 py-5 text-sidebar-foreground md:block">
          <div className="flex h-full flex-col">
            <div className="px-2 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <RiInboxLine size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">
                    Coscience OS
                  </p>
                  <p className="text-sm text-muted-foreground">Foundation</p>
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
                      "flex h-10 items-center gap-3 rounded-md px-3 text-base text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active &&
                        "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4 px-2 text-sm text-muted-foreground">
              <Separator />
              <div className="flex items-center gap-2">
                <RiArchiveLine size={16} />
                Archived records stay stored
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-5 sm:px-8">
              <div className="min-w-0 flex-1 md:hidden">
                <p className="truncate text-base font-semibold">Coscience OS</p>
              </div>
              <div className="relative hidden w-full max-w-md sm:block">
                <RiSearchLine
                  aria-hidden="true"
                  className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground"
                  size={17}
                />
                <Input
                  aria-label="Search records"
                  className="h-10 bg-muted/30 pl-9 text-base"
                  placeholder="Search records..."
                />
              </div>
              <Button size="sm" type="button">
                <RiAddLine />
                New
              </Button>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}

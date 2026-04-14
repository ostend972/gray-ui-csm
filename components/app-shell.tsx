"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { IconBell, IconMessage2, IconSearch } from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"
import { NavUser } from "@/components/nav-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { currentUser } from "@/lib/current-user"
import { getRouteByPathname } from "@/lib/csm-routes"
import { cn } from "@/lib/utils"

type AppShellDisplayMode = "default" | "ticket-detail"

function getShellDisplayMode(pathname: string): AppShellDisplayMode {
  return /^\/tickets\/[^/]+$/.test(pathname) ? "ticket-detail" : "default"
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeRoute = getRouteByPathname(pathname)
  const shellDisplayMode = getShellDisplayMode(pathname)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    if (shellDisplayMode === "ticket-detail") {
      setSidebarOpen(false)
    }
  }, [shellDisplayMode])

  const handleSidebarOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setSidebarOpen(shellDisplayMode === "ticket-detail" ? false : nextOpen)
    },
    [shellDisplayMode]
  )

  return (
    <SidebarProvider
      open={shellDisplayMode === "ticket-detail" ? false : sidebarOpen}
      onOpenChange={handleSidebarOpenChange}
      style={
        {
          "--sidebar-width": "320px",
        } as React.CSSProperties
      }
    >
      <AppSidebar displayMode={shellDisplayMode} />
      <SidebarInset>
        {shellDisplayMode === "default" ? (
          <header className="sticky top-0 flex shrink-0 items-center justify-between gap-4 bg-background p-4">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb className="min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <span className="text-muted-foreground">Workspace</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {activeRoute?.title ?? "Dashboard"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex h-9 items-center gap-3">
              <Button
                variant="outline"
                size="icon-sm"
                className="size-9 rounded-full p-0"
              >
                <IconSearch className="size-4" />
                <span className="sr-only">Search</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="size-9 rounded-full p-0"
              >
                <IconBell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="size-9 rounded-full p-0"
              >
                <IconMessage2 className="size-4" />
                <span className="sr-only">Chat</span>
              </Button>
              <FloatingThemeToggle />
              <Separator
                orientation="vertical"
                className="data-vertical:h-5 data-vertical:self-auto"
              />
              <NavUser user={currentUser} />
            </div>
          </header>
        ) : null}
        <main
          className={cn(
            "mx-auto flex w-full flex-1 flex-col",
            shellDisplayMode === "ticket-detail"
              ? "h-svh min-h-0 max-w-none gap-4 overflow-hidden px-6 py-4 lg:px-8"
              : "max-w-500 gap-4 p-8"
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

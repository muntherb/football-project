"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ComingSoon } from "../../components/coming-soon"

export default function HelpPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="dark">
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <ComingSoon
                title="Help Desk Warming Up!"
                message="Our support team is doing stretches and preparing to assist you! We'll be ready to tackle your questions soon! 🤝"
                icon="🆘"
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

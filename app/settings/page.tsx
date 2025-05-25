"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ComingSoon } from "../../components/coming-soon"

export default function SettingsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="dark">
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <ComingSoon
                title="Settings Locker Room!"
                message="We're organizing the tactical board and adjusting the team formation settings. Everything will be perfectly configured soon! ⚙️"
                icon="🔧"
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

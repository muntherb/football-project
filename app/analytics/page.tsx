"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ComingSoon } from "../../components/coming-soon"

export default function AnalyticsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="dark">
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <ComingSoon
                title="Analytics Lab Brewing!"
                message="Our data scientists are crunching numbers harder than a midfielder tackles! Stats, charts, and insights coming your way soon! 📊"
                icon="🧪"
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

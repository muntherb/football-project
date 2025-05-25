"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ComingSoon } from "../../components/coming-soon"

export default function TrainingPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="dark">
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <ComingSoon
                title="Training Ground Under Construction!"
                message="Our coaches are busy setting up the perfect training drills. We'll have you running laps around the competition soon! ⚽"
                icon="🏃‍♂️"
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

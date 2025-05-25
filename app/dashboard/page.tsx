"use client"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "../../components/app-sidebar"
import { MatchHistoryChart } from "../../components/match-history-chart"
import { PlayersDataTable } from "../../components/players-data-table"
import { SectionCards } from "../../components/section-cards"
import { SiteHeader } from "../../components/site-header"
import { MatchDisplay } from "../../components/match-display"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { supabase, type Player } from "@/lib/supabase"

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const { data, error } = await supabase.from("players").select("*").order("overall_rating", { ascending: false })

        if (error) {
          console.error("Error fetching players:", error)
        } else {
          setPlayers(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const handlePlayerUpdated = (updatedPlayer: Player) => {
    setPlayers((prevPlayers) => {
      const existingPlayerIndex = prevPlayers.findIndex((player) => player.id === updatedPlayer.id)
      if (existingPlayerIndex >= 0) {
        // Update existing player
        return prevPlayers.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player))
      } else {
        // Add new player
        return [...prevPlayers, updatedPlayer].sort((a, b) => b.overall_rating - a.overall_rating)
      }
    })
  }

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="dark">
          <div className="flex h-screen items-center justify-center">
            <div className="text-lg">Loading players...</div>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="dark">
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <MatchDisplay players={players} />
                  </div>
                  <PlayersDataTable data={players} onPlayerUpdated={handlePlayerUpdated} />
                  <div className="px-4 lg:px-6">
                    <MatchHistoryChart />
                  </div>
                  <SectionCards />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

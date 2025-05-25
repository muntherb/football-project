"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, TrophyIcon } from "lucide-react"
import { supabase, type Match } from "@/lib/supabase"

const chartConfig = {
  teamA: {
    label: "Team Alpha",
    color: "hsl(var(--chart-1))",
  },
  teamB: {
    label: "Team Beta",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function MatchHistoryChart() {
  const [matches, setMatches] = React.useState<Match[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchMatches() {
      try {
        const { data, error } = await supabase.from("matches").select("*").order("match_date", { ascending: true })

        if (error) {
          console.error("Error fetching matches:", error)
        } else {
          setMatches(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>Loading match results...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return null // Don't show if no matches
  }

  // Prepare chart data
  const chartData = matches.map((match, index) => ({
    match: `Match ${index + 1}`,
    date: new Date(match.match_date).toLocaleDateString(),
    teamA: match.team_a_score,
    teamB: match.team_b_score,
    location: match.location,
  }))

  // Calculate team statistics
  const teamAWins = matches.filter((m) => m.team_a_score > m.team_b_score).length
  const teamBWins = matches.filter((m) => m.team_b_score > m.team_a_score).length
  const draws = matches.filter((m) => m.team_a_score === m.team_b_score).length

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5" />
          Match History
        </CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Goals scored in recent matches</span>
          <span className="@[540px]/card:hidden">Recent match results</span>
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            Alpha: {teamAWins}W
          </Badge>
          <Badge variant="outline" className="text-xs">
            Beta: {teamBWins}W
          </Badge>
          <Badge variant="outline" className="text-xs">
            Draws: {draws}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="match" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return `${label} - ${data.date}`
                  }
                  return label
                }}
              />
              <Line
                type="monotone"
                dataKey="teamA"
                stroke="var(--color-teamA)"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Team Alpha"
              />
              <Line
                type="monotone"
                dataKey="teamB"
                stroke="var(--color-teamB)"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Team Beta"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Recent Matches</h4>
          {matches
            .slice(-3)
            .reverse()
            .map((match) => (
              <div key={match.id} className="flex items-center justify-between text-sm p-2 rounded border">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{new Date(match.match_date).toLocaleDateString()}</span>
                </div>
                <div className="font-medium">
                  {match.team_a_name} {match.team_a_score} - {match.team_b_score} {match.team_b_name}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCwIcon, CalendarIcon, ClockIcon, MapPinIcon, DropletIcon, TimerIcon } from "lucide-react"
import type { Player } from "@/lib/supabase"
import { balanceTeams, type MatchResult } from "@/lib/team-balancer"

function getPositionColor(position: string) {
  switch (position) {
    case "GK":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "CB":
    case "LB":
    case "RB":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "CDM":
    case "CM":
    case "CAM":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "LW":
    case "RW":
    case "ST":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

function getRatingColor(rating: number) {
  if (rating >= 90) return "text-green-600 dark:text-green-400"
  if (rating >= 80) return "text-blue-600 dark:text-blue-400"
  if (rating >= 70) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

interface TeamDisplayProps {
  team: MatchResult["teamA"]
  teamName: string
  isHome?: boolean
}

function TeamDisplay({ team, teamName, isHome = false }: TeamDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold">{teamName}</h3>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className="text-sm">
            {team.formation.formation}
          </Badge>
          <Badge variant="secondary" className={`text-sm ${getRatingColor(team.averageRating)}`}>
            Avg: {team.averageRating}
          </Badge>
        </div>
      </div>

      <div className="grid gap-2">
        {team.players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground w-6">{index + 1}</div>
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-muted-foreground">{player.team}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getPositionColor(team.formation.positions[index])} border-0 text-xs`}>
                {team.formation.positions[index]}
              </Badge>
              <div className={`font-bold text-sm ${getRatingColor(player.overall_rating)}`}>
                {player.overall_rating}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MatchDisplay({ players }: { players: Player[] }) {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateTeams = async () => {
    if (players.length < 18) {
      setError("Need at least 18 players to generate teams")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Add a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
      const result = balanceTeams(players)
      setMatchResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate teams")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (players.length >= 18) {
      generateTeams()
    }
  }, [players])

  if (players.length < 18) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Monday's Match
          </CardTitle>
          <CardDescription>9 vs 9 Team Selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Need at least 18 players to generate teams. Currently have {players.length} players.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Monday's Match
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                8:00 PM
              </span>
              <span className="flex items-center gap-1">
                <TimerIcon className="h-4 w-4" />
                90 mins
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                Springdales School Gate #4
              </span>
              <span className="flex items-center gap-1">
                <DropletIcon className="h-4 w-4" />
                Cold water provided
              </span>
            </CardDescription>
          </div>
          <Button onClick={generateTeams} disabled={isGenerating} variant="outline" size="sm">
            <RefreshCwIcon className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Regenerate Teams"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>}

        {matchResult && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Rating Difference: {matchResult.ratingDifference.toFixed(1)}
                {matchResult.ratingDifference <= 2 && " ⚡ Excellent Balance"}
                {matchResult.ratingDifference > 2 && matchResult.ratingDifference <= 4 && " ✅ Good Balance"}
                {matchResult.ratingDifference > 4 && " ⚠️ Fair Balance"}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <TeamDisplay team={matchResult.teamA} teamName="Team Alpha" isHome />

              <div className="flex items-center justify-center md:hidden">
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
              </div>

              <TeamDisplay team={matchResult.teamB} teamName="Team Beta" />
            </div>

            <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-background border rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold text-muted-foreground">
                VS
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

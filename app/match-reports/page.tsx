"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, PlusIcon, MoreVerticalIcon, EditIcon, TrashIcon, EyeIcon } from "lucide-react"
import { toast } from "sonner"
import { supabase, type Player, type Match } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MatchDetailsDialog } from "../../components/match-details-dialog"

export default function MatchReportsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [viewingMatch, setViewingMatch] = useState<Match | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [matchForm, setMatchForm] = useState({
    match_date: "",
    team_a_name: "Team Alpha",
    team_b_name: "Team Beta",
    team_a_score: 0,
    team_b_score: 0,
    location: "Springdales School Gate #4",
    duration_minutes: 90,
    notes: "",
  })

  const [playerRatings, setPlayerRatings] = useState<
    Record<
      number,
      {
        team_name: string
        position_played: string
        rating: number
        goals: number
        assists: number
        minutes_played: number
      }
    >
  >({})

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersResult, matchesResult] = await Promise.all([
          supabase.from("players").select("*").order("name"),
          supabase.from("matches").select("*").order("match_date", { ascending: false }),
        ])

        if (playersResult.error) console.error("Error fetching players:", playersResult.error)
        else setPlayers(playersResult.data || [])

        if (matchesResult.error) console.error("Error fetching matches:", matchesResult.error)
        else setMatches(matchesResult.data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePlayerRatingChange = (playerId: number, field: string, value: string | number) => {
    setPlayerRatings((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }))
  }

  const handleSubmitMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let matchData: Match

      if (editingMatch) {
        // Update existing match
        const { data, error: matchError } = await supabase
          .from("matches")
          .update(matchForm)
          .eq("id", editingMatch.id)
          .select()
          .single()

        if (matchError) throw matchError
        matchData = data

        // Delete existing player ratings for this match
        await supabase.from("match_player_ratings").delete().eq("match_id", editingMatch.id)

        toast.success("Match updated successfully!")
      } else {
        // Insert new match
        const { data, error: matchError } = await supabase.from("matches").insert([matchForm]).select().single()

        if (matchError) throw matchError
        matchData = data

        toast.success("Match report added successfully!")
      }

      // Insert player ratings
      const ratingsToInsert = Object.entries(playerRatings)
        .filter(([_, rating]) => rating.rating > 0)
        .map(([playerId, rating]) => ({
          match_id: matchData.id,
          player_id: Number.parseInt(playerId),
          ...rating,
        }))

      if (ratingsToInsert.length > 0) {
        const { error: ratingsError } = await supabase.from("match_player_ratings").insert(ratingsToInsert)

        if (ratingsError) throw ratingsError
      }

      // Reset form
      setMatchForm({
        match_date: "",
        team_a_name: "Team Alpha",
        team_b_name: "Team Beta",
        team_a_score: 0,
        team_b_score: 0,
        location: "Springdales School Gate #4",
        duration_minutes: 90,
        notes: "",
      })
      setPlayerRatings({})
      setShowAddForm(false)
      setEditingMatch(null)

      // Refresh matches
      const { data: updatedMatches } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false })

      if (updatedMatches) setMatches(updatedMatches)
    } catch (error) {
      console.error("Error saving match:", error)
      toast.error("Failed to save match report")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match)
    setMatchForm({
      match_date: match.match_date,
      team_a_name: match.team_a_name,
      team_b_name: match.team_b_name,
      team_a_score: match.team_a_score,
      team_b_score: match.team_b_score,
      location: match.location,
      duration_minutes: match.duration_minutes,
      notes: match.notes,
    })
    setShowAddForm(true)
  }

  const handleDeleteMatch = async (matchId: number) => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("matches").delete().eq("id", matchId)

      if (error) throw error

      toast.success("Match deleted successfully!")

      // Refresh matches
      const { data: updatedMatches } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false })

      if (updatedMatches) setMatches(updatedMatches)
      setDeletingMatchId(null)
    } catch (error) {
      console.error("Error deleting match:", error)
      toast.error("Failed to delete match")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewMatch = (match: Match) => {
    setViewingMatch(match)
    setIsViewDialogOpen(true)
  }

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="dark">
          <div className="flex h-screen items-center justify-center">
            <div className="text-lg">Loading...</div>
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
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Match Reports</h1>
                    <p className="text-muted-foreground">Add match results and view history</p>
                  </div>
                  <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <PlusIcon className="h-4 w-4" />
                    Add Match Report
                  </Button>
                </div>

                {showAddForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingMatch ? "Edit Match Report" : "Add New Match Report"}</CardTitle>
                      <CardDescription>
                        {editingMatch
                          ? "Update match details and player ratings"
                          : "Enter match details and player ratings"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitMatch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="match_date">Match Date</Label>
                            <Input
                              id="match_date"
                              type="date"
                              value={matchForm.match_date}
                              onChange={(e) => setMatchForm((prev) => ({ ...prev, match_date: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team_a_score">Team Alpha Score</Label>
                            <Input
                              id="team_a_score"
                              type="number"
                              min="0"
                              value={matchForm.team_a_score}
                              onChange={(e) =>
                                setMatchForm((prev) => ({ ...prev, team_a_score: Number.parseInt(e.target.value) }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team_b_score">Team Beta Score</Label>
                            <Input
                              id="team_b_score"
                              type="number"
                              min="0"
                              value={matchForm.team_b_score}
                              onChange={(e) =>
                                setMatchForm((prev) => ({ ...prev, team_b_score: Number.parseInt(e.target.value) }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={matchForm.location}
                              onChange={(e) => setMatchForm((prev) => ({ ...prev, location: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="1"
                              value={matchForm.duration_minutes}
                              onChange={(e) =>
                                setMatchForm((prev) => ({ ...prev, duration_minutes: Number.parseInt(e.target.value) }))
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Match Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any notes about the match..."
                            value={matchForm.notes}
                            onChange={(e) => setMatchForm((prev) => ({ ...prev, notes: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Player Ratings</h3>
                          <div className="grid gap-4">
                            {players.map((player) => (
                              <div
                                key={player.id}
                                className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 border rounded-lg"
                              >
                                <div className="font-medium">{player.name}</div>
                                <Select
                                  value={playerRatings[player.id]?.team_name || ""}
                                  onValueChange={(value) => handlePlayerRatingChange(player.id, "team_name", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Team Alpha">Team Alpha</SelectItem>
                                    <SelectItem value="Team Beta">Team Beta</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="Position"
                                  value={playerRatings[player.id]?.position_played || player.position}
                                  onChange={(e) =>
                                    handlePlayerRatingChange(player.id, "position_played", e.target.value)
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Rating (1-10)"
                                  min="1"
                                  max="10"
                                  step="0.1"
                                  value={playerRatings[player.id]?.rating || ""}
                                  onChange={(e) =>
                                    handlePlayerRatingChange(player.id, "rating", Number.parseFloat(e.target.value))
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Goals"
                                  min="0"
                                  value={playerRatings[player.id]?.goals || 0}
                                  onChange={(e) =>
                                    handlePlayerRatingChange(player.id, "goals", Number.parseInt(e.target.value))
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Assists"
                                  min="0"
                                  value={playerRatings[player.id]?.assists || 0}
                                  onChange={(e) =>
                                    handlePlayerRatingChange(player.id, "assists", Number.parseInt(e.target.value))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                              ? editingMatch
                                ? "Updating..."
                                : "Adding..."
                              : editingMatch
                                ? "Update Match Report"
                                : "Add Match Report"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddForm(false)
                              setEditingMatch(null)
                              setMatchForm({
                                match_date: "",
                                team_a_name: "Team Alpha",
                                team_b_name: "Team Beta",
                                team_a_score: 0,
                                team_b_score: 0,
                                location: "Springdales School Gate #4",
                                duration_minutes: 90,
                                notes: "",
                              })
                              setPlayerRatings({})
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Match History</h2>
                  {matches.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No match reports yet. Add your first match above!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    matches.map((match) => (
                      <Card key={match.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <CalendarIcon className="h-5 w-5" />
                              {new Date(match.match_date).toLocaleDateString()}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{match.duration_minutes} mins</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVerticalIcon className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewMatch(match)}>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditMatch(match)}>
                                    <EditIcon className="h-4 w-4 mr-2" />
                                    Edit Match
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeletingMatchId(match.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Delete Match
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <CardDescription>{match.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="text-center">
                              <div className="font-semibold">{match.team_a_name}</div>
                              <div className="text-2xl font-bold">{match.team_a_score}</div>
                            </div>
                            <div className="text-xl font-bold text-muted-foreground">-</div>
                            <div className="text-center">
                              <div className="font-semibold">{match.team_b_name}</div>
                              <div className="text-2xl font-bold">{match.team_b_score}</div>
                            </div>
                          </div>
                          {match.notes && <p className="text-sm text-muted-foreground">{match.notes}</p>}
                        </CardContent>
                      </Card>
                    ))
                  )}

                  <AlertDialog open={deletingMatchId !== null} onOpenChange={() => setDeletingMatchId(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Match Report</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this match report? This action cannot be undone and will also
                          delete all associated player ratings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletingMatchId && handleDeleteMatch(deletingMatchId)}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <MatchDetailsDialog
                    matchId={viewingMatch?.id || null}
                    isOpen={isViewDialogOpen}
                    onClose={() => setIsViewDialogOpen(false)}
                  />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

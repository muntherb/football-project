"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase, type Player } from "@/lib/supabase"

interface EditPlayerDialogProps {
  player: Player
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlayerUpdated: (updatedPlayer: Player) => void
}

export function EditPlayerDialog({ player, open, onOpenChange, onPlayerUpdated }: EditPlayerDialogProps) {
  const [formData, setFormData] = useState({
    name: player.name,
    position: player.position,
    overall_rating: player.overall_rating,
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    stamina: player.stamina,
    team: player.team,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("players")
        .update({
          name: formData.name,
          position: formData.position,
          overall_rating: formData.overall_rating,
          pace: formData.pace,
          shooting: formData.shooting,
          passing: formData.passing,
          stamina: formData.stamina,
          team: formData.team,
          updated_at: new Date().toISOString(),
        })
        .eq("id", player.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success(`${formData.name} has been updated successfully!`)
      onPlayerUpdated(data)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating player:", error)
      toast.error("Failed to update player. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const positions = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>Update {player.name}'s information and stats.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => handleInputChange("team", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overall_rating">Overall Rating (1-99)</Label>
              <Input
                id="overall_rating"
                type="number"
                min="1"
                max="99"
                value={formData.overall_rating}
                onChange={(e) => handleInputChange("overall_rating", Number.parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pace">Pace (1-99)</Label>
              <Input
                id="pace"
                type="number"
                min="1"
                max="99"
                value={formData.pace}
                onChange={(e) => handleInputChange("pace", Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shooting">Shooting (1-99)</Label>
              <Input
                id="shooting"
                type="number"
                min="1"
                max="99"
                value={formData.shooting}
                onChange={(e) => handleInputChange("shooting", Number.parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passing">Passing (1-99)</Label>
              <Input
                id="passing"
                type="number"
                min="1"
                max="99"
                value={formData.passing}
                onChange={(e) => handleInputChange("passing", Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stamina">Stamina (1-99)</Label>
            <Input
              id="stamina"
              type="number"
              min="1"
              max="99"
              value={formData.stamina}
              onChange={(e) => handleInputChange("stamina", Number.parseInt(e.target.value))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

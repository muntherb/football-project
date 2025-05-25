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

interface AddPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlayerAdded: (newPlayer: Player) => void
}

export function AddPlayerDialog({ open, onOpenChange, onPlayerAdded }: AddPlayerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    overall_rating: 70,
    pace: 70,
    shooting: 70,
    passing: 70,
    stamina: 70,
    team: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      overall_rating: 70,
      pace: 70,
      shooting: 70,
      passing: 70,
      stamina: 70,
      team: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.position || !formData.team) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("players")
        .insert([
          {
            name: formData.name,
            position: formData.position,
            overall_rating: formData.overall_rating,
            pace: formData.pace,
            shooting: formData.shooting,
            passing: formData.passing,
            stamina: formData.stamina,
            team: formData.team,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success(`${formData.name} has been added to the squad!`)
      onPlayerAdded(data)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding player:", error)
      toast.error("Failed to add player. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const positions = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogDescription>Add a new player to your squad with their stats and information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Player Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter player name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
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
            <Label htmlFor="team">Team *</Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => handleInputChange("team", e.target.value)}
              placeholder="Enter team name"
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
              {isLoading ? "Adding Player..." : "Add Player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import type { Player } from "./supabase"

export interface TeamFormation {
  formation: string
  positions: string[]
}

export interface BalancedTeam {
  players: Player[]
  totalRating: number
  averageRating: number
  formation: TeamFormation
}

export interface MatchResult {
  teamA: BalancedTeam
  teamB: BalancedTeam
  ratingDifference: number
}

// 9-a-side formations
const FORMATIONS: TeamFormation[] = [
  {
    formation: "3-3-2",
    positions: ["GK", "CB", "CB", "CB", "CM", "CM", "CM", "ST", "ST"],
  },
  {
    formation: "3-2-3",
    positions: ["GK", "CB", "CB", "CB", "CM", "CM", "LW", "ST", "RW"],
  },
  {
    formation: "2-4-2",
    positions: ["GK", "CB", "CB", "CM", "CM", "CM", "CM", "ST", "ST"],
  },
  {
    formation: "3-4-1",
    positions: ["GK", "CB", "CB", "CB", "CM", "CM", "CM", "CM", "ST"],
  },
]

// Position compatibility matrix - more flexible
const POSITION_COMPATIBILITY: Record<string, string[]> = {
  GK: ["GK"],
  CB: ["CB", "LB", "RB", "CDM"],
  LB: ["LB", "CB", "LW", "CM"],
  RB: ["RB", "CB", "RW", "CM"],
  CDM: ["CDM", "CM", "CB", "CAM"],
  CM: ["CM", "CDM", "CAM", "LW", "RW"],
  CAM: ["CAM", "CM", "LW", "RW", "ST"],
  LW: ["LW", "CAM", "ST", "CM"],
  RW: ["RW", "CAM", "ST", "CM"],
  ST: ["ST", "CAM", "LW", "RW", "CM"],
}

function getPositionScore(player: Player, targetPosition: string): number {
  const compatiblePositions = POSITION_COMPATIBILITY[player.position] || [player.position]

  if (player.position === targetPosition) return 100
  if (compatiblePositions.includes(targetPosition)) return 75

  // More lenient for outfield players
  if (player.position !== "GK" && targetPosition !== "GK") return 50

  // Penalty for GK playing outfield or vice versa
  return 20
}

function getPlayerScore(player: Player, targetPosition: string): number {
  const positionScore = getPositionScore(player, targetPosition)
  const ratingScore = player.overall_rating

  // Weight: 70% rating, 30% position fit (prioritize skill over perfect position)
  return ratingScore * 0.7 + positionScore * 0.3
}

function assignPlayersToFormation(availablePlayers: Player[], formation: TeamFormation): Player[] {
  const assignedPlayers: Player[] = []
  const remainingPlayers = [...availablePlayers]

  // First, assign goalkeepers
  const gkPositions = formation.positions.filter((pos) => pos === "GK")
  for (let i = 0; i < gkPositions.length; i++) {
    let bestGK: Player | null = null
    let bestIndex = -1

    for (let j = 0; j < remainingPlayers.length; j++) {
      const player = remainingPlayers[j]
      if (player.position === "GK") {
        bestGK = player
        bestIndex = j
        break
      }
    }

    if (bestGK) {
      assignedPlayers.push(bestGK)
      remainingPlayers.splice(bestIndex, 1)
    } else {
      // If no GK available, assign best available player
      assignedPlayers.push(remainingPlayers[0])
      remainingPlayers.splice(0, 1)
    }
  }

  // Then assign other positions
  const outfieldPositions = formation.positions.filter((pos) => pos !== "GK")
  for (const position of outfieldPositions) {
    let bestPlayer: Player | null = null
    let bestScore = -1
    let bestIndex = -1

    for (let i = 0; i < remainingPlayers.length; i++) {
      const player = remainingPlayers[i]
      const score = getPlayerScore(player, position)

      if (score > bestScore) {
        bestScore = score
        bestPlayer = player
        bestIndex = i
      }
    }

    if (bestPlayer) {
      assignedPlayers.push(bestPlayer)
      remainingPlayers.splice(bestIndex, 1)
    }
  }

  return assignedPlayers
}

function calculateTeamRating(players: Player[]): { total: number; average: number } {
  const total = players.reduce((sum, player) => sum + player.overall_rating, 0)
  return {
    total,
    average: Math.round((total / players.length) * 10) / 10, // Round to 1 decimal
  }
}

export function balanceTeams(players: Player[]): MatchResult {
  if (players.length < 18) {
    throw new Error("Need at least 18 players for two 9-a-side teams")
  }

  // Sort players by overall rating (descending)
  const sortedPlayers = [...players].sort((a, b) => b.overall_rating - a.overall_rating)

  let bestMatch: MatchResult | null = null
  let smallestDifference = Number.POSITIVE_INFINITY

  // Try different formations
  for (const formationA of FORMATIONS) {
    for (const formationB of FORMATIONS) {
      // Try different team combinations
      for (let attempt = 0; attempt < 10; attempt++) {
        const shuffledPlayers = [...sortedPlayers]

        // Add randomness while maintaining some skill balance
        if (attempt > 0) {
          // Shuffle within skill tiers
          const topTier = shuffledPlayers.slice(0, 6)
          const midTier = shuffledPlayers.slice(6, 12)
          const bottomTier = shuffledPlayers.slice(12)

          // Shuffle each tier
          for (let i = topTier.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[topTier[i], topTier[j]] = [topTier[j], topTier[i]]
          }
          for (let i = midTier.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[midTier[i], midTier[j]] = [midTier[j], midTier[i]]
          }
          for (let i = bottomTier.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[bottomTier[i], bottomTier[j]] = [bottomTier[j], bottomTier[i]]
          }

          shuffledPlayers.splice(0, shuffledPlayers.length, ...topTier, ...midTier, ...bottomTier)
        }

        // Simple alternating draft
        const teamAPlayers: Player[] = []
        const teamBPlayers: Player[] = []

        for (let i = 0; i < 18; i++) {
          if (i % 2 === 0) {
            teamAPlayers.push(shuffledPlayers[i])
          } else {
            teamBPlayers.push(shuffledPlayers[i])
          }
        }

        // Assign to formations
        const finalTeamA = assignPlayersToFormation(teamAPlayers, formationA)
        const finalTeamB = assignPlayersToFormation(teamBPlayers, formationB)

        // Accept teams even if not perfectly filled (should be 9 each)
        if (finalTeamA.length >= 8 && finalTeamB.length >= 8) {
          // Pad teams to 9 if needed
          while (finalTeamA.length < 9 && teamAPlayers.length > finalTeamA.length) {
            finalTeamA.push(teamAPlayers[finalTeamA.length])
          }
          while (finalTeamB.length < 9 && teamBPlayers.length > finalTeamB.length) {
            finalTeamB.push(teamBPlayers[finalTeamB.length])
          }

          if (finalTeamA.length === 9 && finalTeamB.length === 9) {
            const teamARating = calculateTeamRating(finalTeamA)
            const teamBRating = calculateTeamRating(finalTeamB)
            const difference = Math.abs(teamARating.average - teamBRating.average)

            if (difference < smallestDifference) {
              smallestDifference = difference
              bestMatch = {
                teamA: {
                  players: finalTeamA,
                  totalRating: teamARating.total,
                  averageRating: teamARating.average,
                  formation: formationA,
                },
                teamB: {
                  players: finalTeamB,
                  totalRating: teamBRating.total,
                  averageRating: teamBRating.average,
                  formation: formationB,
                },
                ratingDifference: difference,
              }
            }
          }
        }
      }
    }
  }

  // If still no match, create a simple fallback
  if (!bestMatch) {
    const teamA = sortedPlayers.slice(0, 9)
    const teamB = sortedPlayers.slice(9, 18)

    const teamARating = calculateTeamRating(teamA)
    const teamBRating = calculateTeamRating(teamB)

    bestMatch = {
      teamA: {
        players: teamA,
        totalRating: teamARating.total,
        averageRating: teamARating.average,
        formation: FORMATIONS[0],
      },
      teamB: {
        players: teamB,
        totalRating: teamBRating.total,
        averageRating: teamBRating.average,
        formation: FORMATIONS[0],
      },
      ratingDifference: Math.abs(teamARating.average - teamBRating.average),
    }
  }

  return bestMatch
}

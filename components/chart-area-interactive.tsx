"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const chartData = [
  { month: "Jan", goals: 12, assists: 8 },
  { month: "Feb", goals: 15, assists: 10 },
  { month: "Mar", goals: 18, assists: 12 },
  { month: "Apr", goals: 22, assists: 15 },
  { month: "May", goals: 25, assists: 18 },
  { month: "Jun", goals: 28, assists: 20 },
]

const chartConfig = {
  goals: {
    label: "Goals",
    color: "hsl(var(--chart-1))",
  },
  assists: {
    label: "Assists",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Goals and assists for the last 6 months</span>
          <span className="@[540px]/card:hidden">Last 6 months</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="12m" className="h-8 px-2.5">
              Last 12 months
            </ToggleGroupItem>
            <ToggleGroupItem value="6m" className="h-8 px-2.5">
              Last 6 months
            </ToggleGroupItem>
            <ToggleGroupItem value="3m" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Last 6 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12m" className="rounded-lg">
                Last 12 months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillGoals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-goals)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-goals)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAssists" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-assists)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-assists)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="assists" type="natural" fill="url(#fillAssists)" stroke="var(--color-assists)" stackId="a" />
            <Area dataKey="goals" type="natural" fill="url(#fillGoals)" stroke="var(--color-goals)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

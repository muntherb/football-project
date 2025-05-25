import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

interface ComingSoonProps {
  title: string
  message: string
  icon: React.ReactNode
}

export function ComingSoon({ title, message, icon }: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="text-6xl">{icon}</div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-lg">{message}</p>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-sm w-full bg-background/60 backdrop-blur-sm border-muted/30">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col gap-6 items-start">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground font-medium">Error 404</p>
            <h1 className="text-2xl font-semibold tracking-tight">This page doesn't exist</h1>
          </div>
          
          <Link href="/" passHref>
            <Button variant="outline" size="sm" className="rounded-full">
              Back to home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export function ComingSoon() {
  return (
    <Alert className="mt-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Coming Soon</AlertTitle>
      <AlertDescription>
        This feature is currently under development and will be available soon.
      </AlertDescription>
    </Alert>
  )
}

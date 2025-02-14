'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const code = searchParams.get('code')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-800">Authentication Error</h1>
        <p className="text-red-600">{code || 'An unexpected error occurred'}</p>
      </div>
    </div>
  )
}

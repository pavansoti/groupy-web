import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">GroupyChat</h1>
          <p className="mt-2 text-sm text-muted-foreground">Real-time chat and social platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Reset Password | Groupy',
  description: 'Reset your password to regain access to your account',
}

export default function ResetPasswordPage() {
  return (
    
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <ResetPasswordForm />
      </div>
    </Suspense>
  )
}

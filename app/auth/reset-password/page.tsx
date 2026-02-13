import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | Groupy',
  description: 'Reset your password to regain access to your account',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <ResetPasswordForm />
    </div>
  )
}

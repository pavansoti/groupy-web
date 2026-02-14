'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { apiService } from '@/lib/services/api'
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/schemas/auth'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  // const [isValidatingToken, setIsValidatingToken] = useState(true)
  // const [tokenValid, setTokenValid] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('Invalid or missing reset token')
        setTimeout(() => router.push('/auth/signin'), 2000)
        return
      }

      // try {
      //   await apiService.resetPassword({ token })
      //   setTokenValid(true)
      // } catch (error: any) {
      //   toast.error(error.response?.data?.message || 'Invalid or expired reset token')
      //   setTokenValid(false)
      //   setTimeout(() => router.push('/auth/signin'), 2000)
      // } finally {
      //   setIsValidatingToken(false)
      // }
    }

    validateToken()
  }, [token, router])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Reset token is missing')
      return
    }

    setIsLoading(true)

    try {
      await apiService.resetPassword({
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      })

      setSubmitted(true)
      toast.success('Password reset successfully!')
      
      setTimeout(() => {
        router.push('/auth/signin')
      }, 5000)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to reset password'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // if (isValidatingToken) {
  //   return (
  //     <Card className="w-full max-w-sm mx-auto bg-background/70 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl">
  //       <CardHeader className="space-y-1 text-center">
  //         <CardTitle className="text-2xl">Verifying Reset Link</CardTitle>
  //       </CardHeader>
  //       <CardContent className="flex justify-center py-8">
  //         <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //       </CardContent>
  //     </Card>
  //   )
  // }

  // if (!tokenValid) {
  //   return (
  //     <Card className="w-full max-w-sm mx-auto bg-background/70 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl">
  //       <CardHeader className="space-y-1 text-center">
  //         <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
  //         <CardDescription>
  //           Your password reset link is invalid or has expired
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <Button
  //           onClick={() => router.push('/auth/signin')}
  //           className="w-full"
  //         >
  //           Back to Sign In
  //         </Button>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-background/70 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Password Reset</CardTitle>
          <CardDescription>
            Your password has been reset successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            You can now sign in with your new password
          </p>
          <Button
            onClick={() => router.push('/auth/signin')}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-background/70 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.push('/auth/signin')}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        <CardDescription>
          Enter a new password to regain access to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            <p>Password must be at least 8 characters long</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/signin" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

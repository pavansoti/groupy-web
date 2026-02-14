'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signinSchema, SigninFormData } from '@/lib/schemas/auth'
import { apiService } from '@/lib/services/api'
import { useAuthStore } from '@/lib/stores/authStore'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export function SigninForm() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  })

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true)
  
    try {
      const response = await apiService.signin(
        data.email,
        data.password
      )
  
      const { success, message, data: payload } = response.data
  
      if (!success) {
        toast.error(message || 'Sign in failed')
        return
      }
  
      const token = payload.token
  
      const user = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      }
  
      // Set token in cookie for middleware
      // document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`

      apiService.setToken(token)
      setToken(token)
      setUser(user)
  
      toast.success(message || 'Signed in successfully!')
      router.push('/feed')
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to sign in'
      )
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <Card
      className="
        w-full max-w-sm
        mx-auto
        bg-background/70
        backdrop-blur-xl
        border border-border/60
        shadow-xl
        rounded-2xl
      "
    >
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue to your account
        </CardDescription>
      </CardHeader>
  
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
  
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="flex flex-col gap-2 text-sm">
            <div className="text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )  
}

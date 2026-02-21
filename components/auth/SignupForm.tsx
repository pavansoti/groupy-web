'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupSchema, SignupFormData } from '@/lib/schemas/auth'
import { apiService } from '@/lib/services/api'
import { useAuthStore } from '@/lib/stores/authStore'
import { toast } from 'sonner'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Eye, EyeOff } from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
  
    try {

      const reqData = {
        email: data.email.trim(),
        username: data.username.trim(),
        password: data.password.trim(),
      };

      const response = await apiService.signup(reqData)

      const { success, message, data: payload } = response.data

      if (!success) {
        toast.error(message || 'Signup failed')
        return
      }

      const token = payload.token
  
      const user = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        // followersCount: payload.followersCount || 0,
        // followingCount: payload.followingCount || 0,
        // postsCount: payload.postsCount || 0,
      }

      // Set token in cookie for middleware
      // document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`

      apiService.setToken(token)
      apiService.setUser(user)
      setToken(token)
      setUser(user)
  
      toast.success('Account created successfully!')
      router.push('/feed')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }  

  return (
    <Card className="
      w-full max-w-sm
      mx-auto
      bg-background/70
      backdrop-blur-xl
      border border-border/60
      shadow-xl
      rounded-2xl
    ">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          Enter your details to get started
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              {...register('username')}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
  
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
  
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
  
}

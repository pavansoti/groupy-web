import { SigninForm } from '@/components/auth/SigninForm'
import AuthLayout from '../layout'

export const metadata = {
  title: 'Sign In - InstaChat',
  description: 'Sign in to your InstaChat account',
}

export default function SigninPage() {
  return <AuthLayout><SigninForm /></AuthLayout>
}

// import { FeedContent } from '@/components/feed/FeedContent'

import { SigninForm } from "@/components/auth/SigninForm";
import { redirect } from "next/navigation"

export default function Home() {
  redirect('/auth/signin')
}

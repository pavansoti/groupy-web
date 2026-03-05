import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'
import { BubbleBackground } from "@/components/ui/BubbleBackground"
import { SocketProvider } from "@/components/providers/SocketProvider"

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GroupyChat - Real-time Chat & Social',
  description: 'A modern Instagram-like application with real-time messaging and social features',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/assets/groupy/groupy-black-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/assets/groupy/groupy-white-logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/assets/groupy/groupy-logo-transparent.png',
        type: 'image/png',
      },
    ],
    apple: '/assets/groupy/groupy-white-image.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <SocketProvider>
              <BubbleBackground />
              <ToastProvider />
              {children}
            </SocketProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

"use client"

import * as React from "react"
import { Check, Paintbrush } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const themes = [
  { name: "Neutral", value: "theme-neutral", color: "bg-zinc-500" },
  { name: "Ocean", value: "theme-ocean", color: "bg-blue-500" },
  { name: "Sunset", value: "theme-sunset", color: "bg-orange-500" },
  { name: "Aurora", value: "theme-aurora", color: "bg-emerald-500" },
  { name: "Royal", value: "theme-royal", color: "bg-violet-500" },
]

export function ThemePicker() {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState("theme-neutral")

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("gradient-theme") || "theme-neutral"
    setTheme(savedTheme)
    document.body.classList.add(savedTheme)
    
    // Cleanup other themes on init
    themes.forEach((t) => {
      if (t.value !== savedTheme) document.body.classList.remove(t.value)
    })
  }, [])

  const setThemeClass = (newTheme: string) => {
    // Remove all existing theme classes
    themes.forEach((t) => document.body.classList.remove(t.value))
    
    // Add new theme class
    document.body.classList.add(newTheme)
    setTheme(newTheme)
    localStorage.setItem("gradient-theme", newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Pick a theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setThemeClass(t.value)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${t.color}`} />
              <span>{t.name}</span>
            </div>
            {theme === t.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

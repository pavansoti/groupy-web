import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const getImageUrl = (url: string | null) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

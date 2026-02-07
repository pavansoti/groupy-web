'use client';

import { useState, useCallback, useEffect } from 'react'
import { apiService } from '@/lib/services/api'

interface SearchResult {
  id: string
  username: string
  bio?: string
  profilePicture?: string
  followersCount: number
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.searchUsers(searchQuery)
        setResults(response.data || [])
      } catch (err: any) {
        setError(err.message || 'Search failed')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, search])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  }
}

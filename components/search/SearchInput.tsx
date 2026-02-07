'use client'

import { Input } from '@/components/ui/input'
import { useSearch } from '@/lib/hooks/useSearch'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  onResultSelect?: (userId: string) => void
}

export function SearchInput({ onResultSelect }: SearchInputProps) {
  const { query, setQuery, results, isLoading } = useSearch()

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="pr-8"
        />
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No users found</div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onResultSelect?.(user.id)
                    setQuery('')
                  }}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {user.profilePicture ? (
                      <img src={user.profilePicture || "/placeholder.svg"} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.followersCount} followers</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

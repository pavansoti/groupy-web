'use client'

import { useState } from 'react'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { Heart, Bookmark, Image } from 'lucide-react'

interface ProfileTabsProps {
  user: User
  isCurrentUser: boolean
}

export function ProfileTabs({ user, isCurrentUser }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts')

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Image, show: true },
    { id: 'liked', label: 'Liked', icon: Heart, show: true },
    { id: 'saved', label: 'Saved', icon: Bookmark, show: isCurrentUser },
  ] as const

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex gap-8">
          {tabs
            .filter((tab) => tab.show)
            .map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'posts' && (
          <PostsGrid />
        )}
        {activeTab === 'liked' && (
          <LikedPostsGrid />
        )}
        {activeTab === 'saved' && isCurrentUser && (
          <SavedPostsGrid />
        )}
      </div>
    </div>
  )
}

function PostsGrid() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {/* TODO: Fetch and display user posts */}
      <EmptyState message="No posts yet" />
    </div>
  )
}

function LikedPostsGrid() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {/* TODO: Fetch and display liked posts */}
      <EmptyState message="No liked posts" />
    </div>
  )
}

function SavedPostsGrid() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {/* TODO: Fetch and display saved posts */}
      <EmptyState message="No saved posts" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-3 flex items-center justify-center py-12">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { Heart, Bookmark, Image as ImageIcon } from 'lucide-react'

interface ProfileTabsProps {
  user: User
  isCurrentUser: boolean
}

type TabId = 'posts' | 'liked' | 'saved'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  show: boolean
}

export function ProfileTabs({ user, isCurrentUser }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('posts')

  const tabs: Tab[] = [
    {
      id: 'posts',
      label: 'Posts',
      icon: <ImageIcon className="h-4 w-4" />,
      show: true,
    },
    {
      id: 'liked',
      label: 'Liked',
      icon: <Heart className="h-4 w-4" />,
      show: isCurrentUser,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <Bookmark className="h-4 w-4" />,
      show: isCurrentUser,
    },
  ]

  const visibleTabs = tabs.filter((tab) => tab.show)

  return (
    <div className="w-full border-t border-border">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {activeTab === 'posts' && <PostsGrid />}
        {activeTab === 'liked' && isCurrentUser && <LikedPostsGrid />}
        {activeTab === 'saved' && isCurrentUser && <SavedPostsGrid />}
      </div>
    </div>
  )
}

function PostsGrid() {
  const hasNoPosts = true // TODO: Replace with actual data check

  if (hasNoPosts) {
    return <EmptyState message="No posts yet" />
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {/* TODO: Fetch and display user posts */}
    </div>
  )
}

function LikedPostsGrid() {
  const hasNoLikedPosts = true // TODO: Replace with actual data check

  if (hasNoLikedPosts) {
    return <EmptyState message="No liked posts" />
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {/* TODO: Fetch and display liked posts */}
    </div>
  )
}

function SavedPostsGrid() {
  const hasNoSavedPosts = true // TODO: Replace with actual data check

  if (hasNoSavedPosts) {
    return <EmptyState message="No saved posts" />
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {/* TODO: Fetch and display saved posts */}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

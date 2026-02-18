import { FeedContent } from '@/components/feed/FeedContent'

export const metadata = {
  title: 'Feed - GroupyChat',
  description: 'Your feed with posts from users you follow',
}

export default function FeedPage() {
  return <FeedContent feedsType = "all" />
}

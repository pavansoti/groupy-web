# InstaChat - Instagram-like Real-time Chat Application

A production-ready Instagram-like web application with real-time messaging, social features, and modern UI built with Next.js, TypeScript, and React.

## Features

### Authentication

- User registration and login with email/password
- JWT-based authentication with token refresh
- Protected routes with automatic redirects
- Secure token storage using sessionStorage

### User Management

- User profiles with bio and follower counts
- Edit profile information
- Follow/unfollow system
- View followers and following lists
- User search with debounced input

### Social Features

- Home feed showing posts from followed users
- Create posts with optional image uploads
- Like/unlike posts
- Comment on posts
- Infinite scroll feed with pagination
- Skeleton loaders for better UX

### Real-time Chat

- 1-to-1 real-time messaging with WebSocket
- Typing indicators
- Online/offline status
- Read receipts
- Auto-scroll to latest messages
- Recent conversations list
- Connection lifecycle handling

### UI/UX

- Dark mode support with next-themes
- Fully responsive mobile-first design
- Modern shadcn/ui components
- Toast notifications with Sonner
- Loading states and error boundaries
- Smooth animations and transitions

## Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI based)
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form + Zod validation
- **Theming**: next-themes
- **Notifications**: Sonner
- **Date Formatting**: date-fns

## Project Structure

```
├── app/
│   ├── (main)/                 # Protected routes
│   │   ├── layout.tsx          # Main app layout with nav/sidebar
│   │   ├── feed/               # Feed page
│   │   ├── search/             # Search page
│   │   ├── chat/               # Chat page
│   │   ├── likes/              # Likes page
│   │   └── profile/            # Profile pages
│   ├── auth/
│   │   ├── signin/             # Sign in page
│   │   ├── signup/             # Sign up page
│   │   └── layout.tsx          # Auth layout
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── page.tsx                # Home (redirects to feed)
│
├── components/
│   ├── auth/                   # Auth components
│   │   ├── SigninForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layout/                 # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── feed/                   # Feed components
│   │   ├── PostCard.tsx
│   │   ├── CreatePostForm.tsx
│   │   └── FeedContent.tsx
│   ├── profile/                # Profile components
│   │   ├── ProfileCard.tsx
│   │   ├── EditProfileForm.tsx
│   │   └── FollowersList.tsx
│   ├── search/                 # Search components
│   │   └── SearchInput.tsx
│   ├── chat/                   # Chat components
│   │   ├── ChatContent.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── MessageBubble.tsx
│   │   └── MessageInput.tsx
│   ├── ui/                     # shadcn/ui components
│   └── providers/              # App providers
│       ├── ThemeProvider.tsx
│       └── ToastProvider.tsx
│
├── lib/
│   ├── services/               # API & WebSocket services
│   │   ├── api.ts              # Axios API client
│   │   └── socket.ts           # Socket.IO client
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts        # Auth state
│   │   ├── feedStore.ts        # Feed state
│   │   ├── chatStore.ts        # Chat state
│   │   └── userStore.ts        # User state
│   ├── schemas/                # Validation schemas
│   │   ├── auth.ts             # Auth schemas
│   │   ├── post.ts             # Post schemas
│   │   └── chat.ts             # Chat schemas
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useSearch.ts
│   └── utils.ts                # Utility functions
│
└── public/                     # Static assets
    └── icons/
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# JWT Token Storage Key
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
```

### Installation

1. Install dependencies:

```bash
npm install
```

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

This is a frontend-only application. The following API endpoints are expected from the backend:

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user
- `POST /auth/refresh` - Refresh JWT token

### Users

- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `GET /users/search?q=query` - Search users
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow user
- `GET /users/:id/followers` - Get followers
- `GET /users/:id/following` - Get following

### Feed & Posts

- `GET /feed?limit=10&offset=0` - Get feed
- `POST /posts` - Create post
- `GET /posts/:id` - Get post details
- `POST /posts/:id/like` - Like post
- `DELETE /posts/:id/like` - Unlike post
- `POST /posts/:id/comments` - Comment on post
- `DELETE /comments/:id` - Delete comment

### Chat

- `GET /conversations` - Get conversations
- `GET /conversations/:id` - Get conversation messages
- `POST /conversations` - Create conversation

### WebSocket Events

- `connect` - Connection established
- `disconnect` - Connection closed
- `join_conversation` - Join conversation room
- `leave_conversation` - Leave conversation room
- `send_message` - Send message
- `new_message` - Receive message
- `typing` - User typing indicator
- `mark_as_read` - Mark messages as read

## State Management

### Zustand Stores

**authStore**: Authentication state

- `user` - Current user data
- `token` - JWT token
- `isAuthenticated` - Auth status

**feedStore**: Feed and posts state

- `posts` - Array of posts
- `isLoading` - Loading state
- `offset` - Pagination offset

**chatStore**: Real-time chat state

- `conversations` - Active conversations
- `messages` - Messages by conversation
- `typingUsers` - Users currently typing
- `onlineUsers` - Online user set

**userStore**: User profiles cache

- `users` - Map of user profiles
- `currentUserProfile` - Current user profile

## Form Validation

All forms use React Hook Form with Zod schemas:

- **Auth Forms**: Email, password, username validation
- **Profile Forms**: Username, bio constraints
- **Post Forms**: Caption length, image uploads
- **Chat Forms**: Message length validation

## Real-time Features

WebSocket connection is automatically established when entering the chat page:

1. User connects to Socket.IO server
2. JWT token is sent for authentication
3. User joins their conversation rooms
4. Real-time events are received and stored in Zustand
5. Connection is maintained with auto-reconnect

## Dark Mode

Toggle dark mode using the theme button in the navbar. Theme preference is persisted using `next-themes`.

## Responsive Design

- **Mobile**: Bottom navigation bar (< 768px)
- **Tablet**: Side navigation + adjusted layout
- **Desktop**: Full sidebar navigation

## Performance Optimizations

- Debounced search input (300ms)
- Infinite scroll pagination
- Memoized components
- Socket.IO connection pooling
- Axios request/response interceptors

## Error Handling

- API errors are caught and displayed as toast notifications
- 401 unauthorized responses trigger automatic logout
- Network errors show user-friendly messages
- WebSocket disconnections trigger reconnection attempts

## Security Features

- JWT-based authentication
- Secure token storage
- Protected routes with automatic redirects
- Input validation with Zod
- CORS handling via API proxy
- HTTP-only cookie support (when configured)

## Future Enhancements

- Image upload to CDN (Vercel Blob, AWS S3)
- Message encryption
- Group chat support
- Post stories feature
- Notifications system
- Advanced search filters
- User blocking
- Report abuse features
- Analytics dashboard

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Component composition best practices

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and feature requests, please create an issue in the repository or contact support at [support@instachat.app](mailto:support@instachat.app)

---

Built with Next.js and hosted on Vercel
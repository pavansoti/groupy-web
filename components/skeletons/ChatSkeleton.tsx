import { Skeleton } from '@/components/ui/skeleton'

// export function ChatSkeleton() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
//       {/* Conversations List Skeleton */}
//       <div className="space-y-2">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div key={i} className="p-3 border border-border rounded-lg">
//             <div className="flex items-center gap-3">
//               <Skeleton className="h-10 w-10 rounded-full" />
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-24 mb-2" />
//                 <Skeleton className="h-3 w-32" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Chat Window Skeleton */}
//       <div className="md:col-span-2 flex flex-col h-full">
//         {/* Header */}
//         <div className="border-b p-4 flex items-center gap-3">
//           <Skeleton className="h-10 w-10 rounded-full" />
//           <div>
//             <Skeleton className="h-4 w-32 mb-2" />
//             <Skeleton className="h-3 w-20" />
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 p-4 space-y-4 overflow-hidden">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
//               <Skeleton className="h-12 w-40" />
//             </div>
//           ))}
//         </div>

//         {/* Input */}
//         <div className="border-t p-4">
//           <Skeleton className="h-10 w-full" />
//         </div>
//       </div>
//     </div>
//   )
// }

export function ChatCardSkeleton() {
  return (
    <div className="w-full space-y-4 p-1">
      
      {/* First Card Skeleton */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-xl animate-pulse">
        
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-muted" />

        {/* Text Content */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted rounded-md" />
          <div className="h-3 w-48 bg-muted rounded-md" />
        </div>
      </div>

      {/* Second Card Skeleton */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-xl animate-pulse">
        
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-muted" />

        {/* Text Content */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-muted rounded-md" />
          <div className="h-3 w-20 bg-muted rounded-md" />
        </div>
      </div>

    </div>
  )
}
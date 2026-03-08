'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Play } from 'lucide-react'

interface FeedVideoProps {
  src: string
}

export default function FeedVideo({ src }: FeedVideoProps) {

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (!videoRef.current) return

        if (entry.isIntersecting) {
          videoRef.current.play()
          setPlaying(true)
        } else {
          videoRef.current.pause()
          setPlaying(false)
        }

      },
      { threshold: 0.6 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()

  }, [])

  const togglePlay = () => {

    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }

  }

  const toggleMute = () => {

    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)

  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[340px] bg-black flex items-center justify-center overflow-hidden"
      onClick={togglePlay}
    >

      <video
        ref={videoRef}
        src={src}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        className="h-full w-auto object-contain"
      />

      {/* Play icon */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-12 h-12 text-white/90" />
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleMute()
        }}
        className="absolute bottom-3 right-3 bg-black/60 rounded-full p-2"
      >
        {muted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>

    </div>
  )
}
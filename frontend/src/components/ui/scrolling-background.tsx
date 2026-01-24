'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

// Sports images with proper names
const sportsImages = [
  { src: '/sports/DSC00347.JPG', sport: 'Cricket' },
  { src: '/sports/DSC00406.JPG', sport: 'Football' },
  { src: '/sports/DSC00543.JPG', sport: 'Basketball' },
  { src: '/sports/DSC00556.JPG', sport: 'Volleyball' },
  { src: '/sports/DSC00569.JPG', sport: 'Athletics' },
]

interface ScrollingBackgroundProps {
  opacity?: number
  blur?: number
}

export function ScrollingBackground({ opacity = 0.15, blur = 0 }: ScrollingBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate images with crossfade
  const transitionToNext = useCallback(() => {
    setIsTransitioning(true)
    setNextIndex((currentIndex + 1) % sportsImages.length)
    
    setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % sportsImages.length)
      setIsTransitioning(false)
    }, 1500) // Match transition duration
  }, [currentIndex])

  useEffect(() => {
    const interval = setInterval(transitionToNext, 5000)
    return () => clearInterval(interval)
  }, [transitionToNext])

  const parallaxOffset = scrollY * 0.3

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ opacity }}
    >
      {/* Background Images with Crossfade */}
      {sportsImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{
            opacity: index === currentIndex ? 1 : (index === nextIndex && isTransitioning ? 1 : 0),
            zIndex: index === nextIndex && isTransitioning ? 2 : 1,
          }}
        >
          <Image
            src={image.src}
            alt={image.sport}
            fill
            className="object-cover"
            style={{
              transform: `scale(1.1) translateY(${parallaxOffset}px)`,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
            }}
            sizes="100vw"
            priority={index === 0}
            quality={60}
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ffe5cd]/90 via-[#ffe5cd]/70 to-[#ffe5cd]/90 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#ffe5cd]/80 via-transparent to-[#ffe5cd]/80 z-10" />
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 z-20 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default ScrollingBackground

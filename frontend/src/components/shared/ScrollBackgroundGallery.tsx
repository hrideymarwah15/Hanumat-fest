'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface GalleryImage {
  src: string
  alt: string
  section: string
}

interface ScrollBackgroundGalleryProps {
  images: GalleryImage[]
  sections: string[] // Section IDs to track
  enableParallax?: boolean
  enableZoom?: boolean
}

export function ScrollBackgroundGallery({ 
  images, 
  sections,
  enableParallax = true,
  enableZoom = true
}: ScrollBackgroundGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(0)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [imageScale, setImageScale] = useState(1)
  const [parallaxY, setParallaxY] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(images.length).fill(false))
  const rafRef = useRef<number | undefined>(undefined)
  const lastScrollY = useRef(0)
  const isLowPerformance = useRef(false)

  // Detect low-performance devices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if mobile or reduced motion preference
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      isLowPerformance.current = isMobile || prefersReducedMotion
    }
  }, [])

  // Preload images
  useEffect(() => {
    images.forEach((image, index) => {
      const img = new window.Image()
      img.src = image.src
      img.onload = () => {
        setImagesLoaded(prev => {
          const newLoaded = [...prev]
          newLoaded[index] = true
          return newLoaded
        })
      }
    })
  }, [images])

  // Calculate which image should be shown based on scroll position
  const calculateImageIndex = useCallback(() => {
    if (typeof window === 'undefined') return

    const scrollY = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // Calculate scroll progress (0 to 1)
    const maxScroll = documentHeight - windowHeight
    const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1)
    
    // Map scroll progress to image index
    const imageCount = images.length
    const imageIndexFloat = scrollProgress * (imageCount - 1)
    const newCurrentIndex = Math.floor(imageIndexFloat)
    const newNextIndex = Math.min(newCurrentIndex + 1, imageCount - 1)
    const transition = imageIndexFloat - newCurrentIndex

    setCurrentImageIndex(newCurrentIndex)
    setNextImageIndex(newNextIndex)
    setTransitionProgress(transition)

    // Parallax effect
    if (enableParallax && !isLowPerformance.current) {
      const parallax = (scrollY - lastScrollY.current) * 0.5
      setParallaxY(parallax)
      lastScrollY.current = scrollY
    }

    // Zoom effect per image
    if (enableZoom && !isLowPerformance.current) {
      // Scale from 1 to 1.05 as transition progresses, then reset
      const scale = transition < 0.5 
        ? 1 + (transition * 2) * 0.05 
        : 1.05 - ((transition - 0.5) * 2) * 0.05
      setImageScale(scale)
    }
  }, [images.length, enableParallax, enableZoom])

  // Optimized scroll handler with RAF
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(calculateImageIndex)
    }

    // Initial calculation
    calculateImageIndex()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', calculateImageIndex, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', calculateImageIndex)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [calculateImageIndex])

  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden bg-black"
    >
      {/* Current Image */}
      <div 
        className="absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{ 
          opacity: 1 - transitionProgress,
          transform: enableParallax && !isLowPerformance.current 
            ? `translate3d(0, ${parallaxY}px, 0) scale(${imageScale})` 
            : `scale(${imageScale})`,
          willChange: 'opacity',
        }}
      >
        {imagesLoaded[currentImageIndex] && (
          <Image
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].alt}
            fill
            className="object-cover"
            quality={90}
            priority={currentImageIndex === 0}
            sizes="100vw"
          />
        )}
      </div>

      {/* Next Image (for smooth crossfade) */}
      {currentImageIndex !== nextImageIndex && (
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{ 
            opacity: transitionProgress,
            transform: enableParallax && !isLowPerformance.current 
              ? `translate3d(0, ${parallaxY}px, 0) scale(${imageScale})` 
              : `scale(${imageScale})`,
            willChange: 'opacity',
          }}
        >
          {imagesLoaded[nextImageIndex] && (
            <Image
              src={images[nextImageIndex].src}
              alt={images[nextImageIndex].alt}
              fill
              className="object-cover"
              quality={90}
              priority={nextImageIndex <= 1}
              sizes="100vw"
            />
          )}
        </div>
      )}

      {/* Dark gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none" />
    </div>
  )
}

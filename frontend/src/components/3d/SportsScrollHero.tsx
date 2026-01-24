'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// Sports images with proper names
const sportsImages = [
  { src: '/sports/DSC00347.JPG', sport: 'Cricket', color: '#b20e38' },
  { src: '/sports/DSC00406.JPG', sport: 'Football', color: '#0e0e0e' },
  { src: '/sports/DSC00543.JPG', sport: 'Basketball', color: '#b20e38' },
  { src: '/sports/DSC00556.JPG', sport: 'Volleyball', color: '#0e0e0e' },
  { src: '/sports/DSC00569.JPG', sport: 'Athletics', color: '#b20e38' },
]

export function SportsScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageScale, setImageScale] = useState(1)
  const [clipProgress, setClipProgress] = useState<number[]>(sportsImages.map((_, i) => i === 0 ? 100 : 0))

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sportsImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Scroll-based scale effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const progress = Math.min(scrollY / (windowHeight * 0.5), 1)
      setImageScale(1 + progress * 0.4)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate clip paths on currentIndex change
  useEffect(() => {
    const newProgress = sportsImages.map((_, i) => (i === currentIndex ? 100 : 0))
    // Smooth transition
    const steps = 20
    let step = 0
    const startProgress = [...clipProgress]
    
    const animate = () => {
      step++
      const t = step / steps
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // easeInOutQuad
      
      const interpolated = sportsImages.map((_, i) => {
        return startProgress[i] + (newProgress[i] - startProgress[i]) * eased
      })
      
      setClipProgress(interpolated)
      
      if (step < steps) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  return (
    <div 
      ref={containerRef}
      className="absolute right-0 top-1/2 -translate-y-1/2 w-[55vw] h-[85vh] pointer-events-none z-0 hidden md:block"
    >
      {/* Orbital Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="absolute w-[500px] h-[500px] lg:w-[650px] lg:h-[650px]"
          style={{ transform: 'rotateX(70deg) rotateZ(15deg)' }}
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-[#ffe5cd]/30 animate-spin-slow" />
          {/* Inner Ring */}
          <div className="absolute inset-8 rounded-full border border-[#b20e38]/20 animate-spin-slow-reverse" />
          {/* Innermost Ring */}
          <div className="absolute inset-16 rounded-full border border-[#0e0e0e]/10 animate-spin-slow" />
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#b20e38] animate-pulse"
          style={{
            width: `${6 + (i % 4) * 6}px`,
            height: `${6 + (i % 4) * 6}px`,
            top: `${15 + (i * 10) % 70}%`,
            right: `${5 + (i * 12) % 50}%`,
            opacity: 0.15 + (i % 4) * 0.1,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${2 + i * 0.3}s`,
          }}
        />
      ))}

      {/* Main Image Container */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[440px] lg:w-[420px] lg:h-[580px] rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 40px 100px rgba(178, 14, 56, 0.25), 0 20px 50px rgba(0,0,0,0.15)',
          transform: `translate(-50%, -50%) scale(${imageScale})`,
          transition: 'transform 0.1s ease-out' 
        }}
      >
        {/* Image Stack */}
        {sportsImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out"
            style={{
              clipPath: `polygon(0% ${100 - clipProgress[index]}%, 100% ${100 - clipProgress[index]}%, 100% 100%, 0% 100%)`,
              zIndex: index + 1,
            }}
          >
            <Image
              src={image.src}
              alt={image.sport}
              fill
              className="object-cover transition-transform duration-700"
              style={{ transform: `scale(${1 + (index === currentIndex ? 0.1 : 0)})` }}
              sizes="(max-width: 768px) 320px, 420px"
              priority={index === 0}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Sport Label */}
            <div className="absolute bottom-6 left-6 right-6">
              <span 
                className="text-white/80 text-xs font-medium tracking-widest uppercase"
              >
                HANUMANT 2026
              </span>
              <h3 
                className="text-white font-heading text-3xl lg:text-4xl tracking-wide mt-1"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
              >
                {image.sport}
              </h3>
            </div>
          </div>
        ))}

        {/* Frame Border */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: '1px solid rgba(255, 229, 205, 0.2)',
            boxShadow: 'inset 0 0 50px rgba(178, 14, 56, 0.05)'
          }}
        />

        {/* Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#b20e38]/40 rounded-tl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#b20e38]/40 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#b20e38]/40 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#b20e38]/40 rounded-br" />
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {sportsImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 rounded-full pointer-events-auto ${
              currentIndex === index 
                ? 'w-8 h-2 bg-[#b20e38]' 
                : 'w-2 h-2 bg-[#0e0e0e]/30 hover:bg-[#0e0e0e]/50'
            }`}
            aria-label={`View ${sportsImages[index].sport}`}
          />
        ))}
      </div>
    </div>
  )
}

export default SportsScrollHero

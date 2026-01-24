'use client'

import { useState, useEffect } from 'react'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ScrollingBackground } from '@/components/ui/scrolling-background'
import { InteractiveCursor } from '@/components/ui/interactive-cursor'

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if this is the first visit in this session
    const hasLoaded = sessionStorage.getItem('hanumant-loaded')
    
    if (hasLoaded) {
      setIsLoading(false)
      setShowContent(true)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hanumant-loaded', 'true')
    setShowContent(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} minDuration={2500} />}
      
      {/* Background */}
      {showContent && <ScrollingBackground opacity={0.08} blur={3} />}
      
      {/* Interactive Cursor */}
      {showContent && <InteractiveCursor />}
      
      {/* Main Content */}
      <div 
        className={`relative z-10 transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </>
  )
}

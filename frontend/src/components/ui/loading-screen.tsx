'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onComplete?: () => void
  minDuration?: number
}

export function LoadingScreen({ onComplete, minDuration = 2500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentSport, setCurrentSport] = useState(0)

  const sports = ['🏏', '⚽', '🏀', '🏐', '🏸', '🏓', '🎾', '♟️']
  const sportNames = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Table Tennis', 'Lawn Tennis', 'Chess']

  useEffect(() => {
    // Progress animation
    const duration = minDuration
    const steps = 100
    const stepDuration = duration / steps
    let currentProgress = 0

    const progressInterval = setInterval(() => {
      currentProgress += 1
      // Easing for more natural progress feel
      const easedProgress = currentProgress <= 70 
        ? currentProgress * 1.2 
        : 70 + (currentProgress - 70) * 0.6
      
      setProgress(Math.min(easedProgress, 100))

      if (currentProgress >= steps) {
        clearInterval(progressInterval)
        setTimeout(() => {
          setIsComplete(true)
          onComplete?.()
        }, 300)
      }
    }, stepDuration)

    // Sport rotation
    const sportInterval = setInterval(() => {
      setCurrentSport(prev => (prev + 1) % sports.length)
    }, 300)

    return () => {
      clearInterval(progressInterval)
      clearInterval(sportInterval)
    }
  }, [minDuration, onComplete, sports.length])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#0e0e0e] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(178, 14, 56, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(178, 14, 56, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                animation: 'gridMove 20s linear infinite',
              }}
            />
          </div>

          {/* Radial Glow */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(178, 14, 56, 0.2) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#b20e38]"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                scale: 0,
                opacity: 0,
              }}
              animate={{
                y: [null, -20, 20, -10, 0],
                scale: [0, 1, 0.8, 1],
                opacity: [0, 0.6, 0.4, 0.6],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
              }}
            />
          ))}

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
              className="relative mb-8"
            >
              {/* Rotating Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full border-2 border-dashed border-[#b20e38]/40"
              />
              
              {/* Logo Circle */}
              <div className="w-24 h-24 rounded-full bg-[#b20e38] flex items-center justify-center shadow-2xl shadow-[#b20e38]/30">
                <motion.span
                  key={currentSport}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: 'spring', duration: 0.3 }}
                  className="text-4xl"
                >
                  {sports[currentSport]}
                </motion.span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading text-5xl md:text-7xl text-white tracking-wider mb-2"
            >
              HANUMANT
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[#ffe5cd] text-sm tracking-[0.3em] uppercase mb-8"
            >
              Rishihood Sports Fest 2026
            </motion.p>

            {/* Current Sport Name */}
            <motion.div
              key={currentSport}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white/60 text-sm mb-6 h-5"
            >
              Loading {sportNames[currentSport]}...
            </motion.div>

            {/* Progress Bar */}
            <div className="w-64 md:w-80 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-[#b20e38] to-[#ff4d6d] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            {/* Progress Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-white/40 text-xs tracking-widest font-mono"
            >
              {Math.round(progress)}% LOADING
            </motion.p>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
            <svg
              viewBox="0 0 1440 120"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <motion.path
                initial={{ d: 'M0,60 Q360,120 720,60 T1440,60 V120 H0 Z' }}
                animate={{ 
                  d: [
                    'M0,60 Q360,120 720,60 T1440,60 V120 H0 Z',
                    'M0,80 Q360,40 720,80 T1440,80 V120 H0 Z',
                    'M0,60 Q360,120 720,60 T1440,60 V120 H0 Z',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                fill="rgba(178, 14, 56, 0.1)"
              />
            </svg>
          </div>

          {/* CSS for grid animation */}
          <style jsx>{`
            @keyframes gridMove {
              0% { transform: translate(0, 0); }
              100% { transform: translate(50px, 50px); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.1); opacity: 0.5; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

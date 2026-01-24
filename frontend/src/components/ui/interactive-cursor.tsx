'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function InteractiveCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [cursorText, setCursorText] = useState('')

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
    if (!isVisible) setIsVisible(true)
  }, [isVisible])

  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const cursorType = target.closest('[data-cursor]')
    if (cursorType) {
      setIsHovering(true)
      const text = cursorType.getAttribute('data-cursor-text')
      if (text) setCursorText(text)
    }
  }, [])

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const cursorType = target.closest('[data-cursor]')
    if (cursorType) {
      setIsHovering(false)
      setCursorText('')
    }
  }, [])

  useEffect(() => {
    // Only enable on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 768) return

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave])

  if (!isVisible) return null

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#b20e38] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />

      {/* Cursor Ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-[#b20e38]/50 rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isHovering ? 2 : 1,
          opacity: isHovering ? 1 : 0.5,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      >
        <AnimatePresence>
          {cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-[8px] font-bold text-[#b20e38] uppercase tracking-wider whitespace-nowrap"
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

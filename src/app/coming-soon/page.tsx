"use client"

import { Button } from "@/components/ui/button"
import { MoveLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function BallTrail() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!containerRef.current) return

    const container = containerRef.current
    const numBalls = 30
    const balls: { 
      element: HTMLDivElement; 
      x: number; 
      y: number; 
      scale: number; 
      color: string;
      baseSize: number;
      pulsePhase: number;
      pulseSpeed: number;
    }[] = []

    // Generate colors
    const colors = [
      "#FF5E5B", "#D8D8D8", "#FFFFEA", "#00CECB", "#FFED66", 
      "#FF8552", "#E6E6FA", "#FFCC33", "#FF3366", "#66CCFF"
    ]

    // Create balls
    for (let i = 0; i < numBalls; i++) {
      const ball = document.createElement("div")
      ball.classList.add("ball")
      container.appendChild(ball)
      
      const color = colors[Math.floor(Math.random() * colors.length)]
      const baseSize = 10 + Math.random() * 15 // Size between 10px and 25px
      
      balls.push({ 
        element: ball, 
        x: 0, 
        y: 0, 
        scale: 1,
        color: color,
        baseSize: baseSize,
        pulsePhase: Math.random() * Math.PI * 2, // Random starting phase
        pulseSpeed: 0.03 + Math.random() * 0.04  // Random pulse speed
      })
      
      // Set the initial color and size
      ball.style.backgroundColor = color
      ball.style.width = `${baseSize}px`
      ball.style.height = `${baseSize}px`
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    const shouldHandleEvent = (e: MouseEvent | TouchEvent): boolean => {
      // Check if the event target is a button or link or their descendant
      const target = e.target as HTMLElement
      if (!target) return true
      
      // Don't handle events on interactive elements
      const closest = target.closest('a, button, [role="button"]')
      return !closest
    }

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      // Skip handling if event is on interactive element
      if (!shouldHandleEvent(e)) return
      
      // Prevent default behavior for touch events
      if ("touches" in e) {
        e.preventDefault()
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
      } else {
        // It's a mouse event
        mouseX = (e as MouseEvent).clientX
        mouseY = (e as MouseEvent).clientY
      }
    }

    // Handle touchmove separately to prevent default behavior
    const handleTouchMove = (e: TouchEvent) => {
      // Skip handling if event is on interactive element
      if (!shouldHandleEvent(e)) return
      
      e.preventDefault()
      mouseX = e.touches[0].clientX
      mouseY = e.touches[0].clientY
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchstart", handleTouchMove, { passive: false })

    function animate() {
      let prevX = mouseX
      let prevY = mouseY

      balls.forEach((ball, index) => {
        const dx = prevX - ball.x
        const dy = prevY - ball.y

        // Follow speed based on index - trailing effect
        const followSpeed = 0.12 - (index * 0.002)
        ball.x += dx * followSpeed
        ball.y += dy * followSpeed

        const distance = Math.sqrt(dx * dx + dy * dy)
        ball.scale = Math.max(0.3, 1 - distance / 100)
        
        // Update the pulse animation
        ball.pulsePhase += ball.pulseSpeed
        const pulseScale = 0.15 * Math.sin(ball.pulsePhase) + 1
        
        // Apply all transformations
        ball.element.style.transform = `translate(${ball.x}px, ${ball.y}px) scale(${ball.scale * pulseScale})`
        
        // Apply opacity based on distance
        const opacity = Math.max(0.2, Math.min(1, (1 - index/numBalls) * 1.5))
        ball.element.style.opacity = opacity.toString()

        prevX = ball.x
        prevY = ball.y
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchstart", handleTouchMove)
      balls.forEach((ball) => ball.element.remove())
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 bg-gradient-to-b from-black to-gray-900 overflow-hidden cursor-none">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 text-center">
            Coming Soon
          </h1>
          <p className="text-xl text-gray-400 mb-8 text-center">We're working on something exciting!</p>
          <div className="flex justify-center">
            <Link href="/dashboard" className="inline-block" prefetch={false}>
              <Button 
                size="lg" 
                className="relative cursor-pointer hover:cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <MoveLeft className="mr-2" /> Go back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .ball {
          position: fixed;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          filter: blur(2px);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          transition: background-color 0.5s ease;
        }
        
        html, body {
          overflow: hidden;
          overscroll-behavior: none;
          touch-action: none;
          -webkit-overflow-scrolling: none;
          position: fixed;
          width: 100%;
          height: 100%;
        }
        
        /* Enhanced button and link interaction */
        a, button, [role="button"] {
          cursor: pointer !important;
          pointer-events: auto !important;
          touch-action: auto !important;
          position: relative;
          z-index: 100;
        }

        /* Show cursor when hovering over clickable elements */
        a:hover, button:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  )
}
import React, { useEffect, useRef } from 'react'

const SignatureAnimation = ({ width = 200, height = 100, duration = 2000 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = width
    canvas.height = height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Create gradient for the signature
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#10b981') // Green
    gradient.addColorStop(1, '#fbbf24') // Yellow
    
    // Signature path points (curved signature)
    const points = [
      { x: 20, y: 60 },
      { x: 35, y: 45 },
      { x: 50, y: 55 },
      { x: 65, y: 40 },
      { x: 80, y: 50 },
      { x: 95, y: 35 },
      { x: 110, y: 45 },
      { x: 125, y: 30 },
      { x: 140, y: 40 },
      { x: 155, y: 25 },
      { x: 170, y: 35 },
      { x: 185, y: 20 },
      { x: 200, y: 30 }
    ]
    
    // Animation variables
    let startTime = null
    let currentPoint = 0
    
    // Pen position
    let penX = points[0].x
    let penY = points[0].y
    
    // Draw pen
    const drawPen = (x, y) => {
      ctx.save()
      
      // Pen body
      ctx.fillStyle = '#374151'
      ctx.fillRect(x - 2, y - 8, 4, 16)
      
      // Pen tip
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 3, y + 6)
      ctx.lineTo(x + 3, y + 6)
      ctx.closePath()
      ctx.fillStyle = '#1f2937'
      ctx.fill()
      
      // Pen highlight
      ctx.fillStyle = '#6b7280'
      ctx.fillRect(x - 1, y - 6, 2, 12)
      
      ctx.restore()
    }
    
    // Draw signature line
    const drawSignature = (progress) => {
      ctx.save()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      
      for (let i = 1; i < points.length; i++) {
        const point = points[i]
        const prevPoint = points[i - 1]
        
        if (i <= progress * points.length) {
          // Smooth curve between points
          const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.5
          const cp1y = prevPoint.y
          const cp2x = point.x - (point.x - prevPoint.x) * 0.5
          const cp2y = point.y
          
          ctx.quadraticCurveTo(cp1x, cp1y, point.x, point.y)
        }
      }
      
      ctx.stroke()
      ctx.restore()
    }
    
    // Animation loop
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw signature
      drawSignature(progress)
      
      // Update pen position
      const currentIndex = Math.floor(progress * (points.length - 1))
      if (currentIndex < points.length - 1) {
        const currentPoint = points[currentIndex]
        const nextPoint = points[currentIndex + 1]
        const subProgress = (progress * (points.length - 1)) % 1
        
        penX = currentPoint.x + (nextPoint.x - currentPoint.x) * subProgress
        penY = currentPoint.y + (nextPoint.y - currentPoint.y) * subProgress
      } else {
        penX = points[points.length - 1].x
        penY = points[points.length - 1].y
      }
      
      // Draw pen
      drawPen(penX, penY)
      
      // Continue animation
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete - add a small pause then restart
        setTimeout(() => {
          startTime = null
          requestAnimationFrame(animate)
        }, 1000)
      }
    }
    
    // Start animation
    requestAnimationFrame(animate)
    
    // Cleanup
    return () => {
      // Animation will continue until component unmounts
    }
  }, [width, height, duration])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(16,185,129,0.2)'
      }}
    />
  )
}

export default SignatureAnimation 
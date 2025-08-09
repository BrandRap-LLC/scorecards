import * as React from "react"
import { createPortal } from "react-dom"

interface CellTooltipProps {
  content: string
  children: React.ReactNode
  className?: string
}

export function CellTooltip({ content, children, className = "" }: CellTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [placement, setPlacement] = React.useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    
    const margin = 8 // Space between trigger and tooltip
    
    // Calculate positions for each placement
    const positions = {
      top: {
        top: triggerRect.top - tooltipRect.height - margin + scrollY,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + scrollX
      },
      bottom: {
        top: triggerRect.bottom + margin + scrollY,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + scrollX
      },
      left: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + scrollY,
        left: triggerRect.left - tooltipRect.width - margin + scrollX
      },
      right: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + scrollY,
        left: triggerRect.right + margin + scrollX
      }
    }
    
    // Determine best placement based on available space
    let bestPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top'
    
    // Check if tooltip fits above
    if (positions.top.top >= scrollY) {
      bestPlacement = 'top'
    } 
    // Check if tooltip fits below
    else if (positions.bottom.top + tooltipRect.height <= scrollY + viewportHeight) {
      bestPlacement = 'bottom'
    }
    // Check if tooltip fits to the left
    else if (positions.left.left >= scrollX) {
      bestPlacement = 'left'
    }
    // Default to right
    else {
      bestPlacement = 'right'
    }
    
    // Apply the best position
    let finalPosition = positions[bestPlacement]
    
    // Adjust horizontal position to stay within viewport
    if (bestPlacement === 'top' || bestPlacement === 'bottom') {
      if (finalPosition.left < scrollX) {
        finalPosition.left = scrollX + margin
      } else if (finalPosition.left + tooltipRect.width > scrollX + viewportWidth) {
        finalPosition.left = scrollX + viewportWidth - tooltipRect.width - margin
      }
    }
    
    // Adjust vertical position to stay within viewport
    if (bestPlacement === 'left' || bestPlacement === 'right') {
      if (finalPosition.top < scrollY) {
        finalPosition.top = scrollY + margin
      } else if (finalPosition.top + tooltipRect.height > scrollY + viewportHeight) {
        finalPosition.top = scrollY + viewportHeight - tooltipRect.height - margin
      }
    }
    
    setPosition(finalPosition)
    setPlacement(bestPlacement)
  }

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  React.useEffect(() => {
    if (isVisible) {
      calculatePosition()
      
      // Recalculate on scroll or resize
      const handleUpdate = () => calculatePosition()
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isVisible])

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-200`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {content}
      {/* Arrow */}
      <div
        className={`absolute w-0 h-0 ${
          placement === 'top'
            ? 'left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900'
            : placement === 'bottom'
            ? 'left-1/2 transform -translate-x-1/2 bottom-full border-4 border-transparent border-b-gray-900'
            : placement === 'left'
            ? 'left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900'
            : 'right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900'
        }`}
      />
    </div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`cursor-help ${className}`}
      >
        {children}
      </div>
      {typeof window !== 'undefined' && isVisible && createPortal(tooltipContent, document.body)}
    </>
  )
}
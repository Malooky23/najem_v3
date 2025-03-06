import { useState, useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const previousValueRef = useRef<T>(value)

  useEffect(() => {
    // Skip debounce if the value hasn't actually changed
    if (previousValueRef.current === value) {
      return
    }
    
    previousValueRef.current = value
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
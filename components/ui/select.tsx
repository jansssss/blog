'use client'

import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within Select')
  }
  return context
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 opacity-50 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

export const SelectValue = () => {
  const { value } = useSelectContext()
  const [displayValue, setDisplayValue] = React.useState<string>('')

  React.useEffect(() => {
    // Find the selected item's label from SelectItem children
    const selectedElement = document.querySelector(`[data-select-value="${value}"]`)
    if (selectedElement) {
      setDisplayValue(selectedElement.textContent || '')
    }
  }, [value])

  return <span>{displayValue || '선택하세요'}</span>
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export const SelectContent = ({ children, className }: SelectContentProps) => {
  const { open, setOpen } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute top-full left-0 z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const SelectItem = ({ value: itemValue, children, className }: SelectItemProps) => {
  const { value, onValueChange, setOpen } = useSelectContext()
  const isSelected = value === itemValue

  return (
    <div
      data-select-value={itemValue}
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        isSelected && 'bg-accent',
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

import * as React from "react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as any, {
              onClick: () => setIsOpen(!isOpen),
              'aria-expanded': isOpen,
              selectedValue
            })
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child as any, {
              onValueChange: handleValueChange,
              selectedValue
            })
          }
        }
        return child
      })}
    </div>
  )
}

export function SelectTrigger({ className = "", children, ...props }: SelectTriggerProps & any) {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectValue) {
          return React.cloneElement(child as any, { selectedValue: props.selectedValue })
        }
        return child
      })}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function SelectContent({ children, ...props }: SelectContentProps & any) {
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            const childWithProps = child as React.ReactElement<any>
            return React.cloneElement(childWithProps, {
              onValueChange: props.onValueChange,
              isSelected: childWithProps.props.value === props.selectedValue
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

export function SelectItem({ value, children, ...props }: SelectItemProps & any) {
  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
        props.isSelected ? 'bg-accent text-accent-foreground' : ''
      }`}
      onClick={() => props.onValueChange?.(value)}
    >
      {props.isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {children}
    </div>
  )
}

export function SelectValue({ placeholder = "Select...", ...props }: SelectValueProps & any) {
  return <span>{props.selectedValue || placeholder}</span>
}
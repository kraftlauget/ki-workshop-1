import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange }: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            isOpen,
            setIsOpen,
            selectedValue,
            onValueChange: handleValueChange
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  selectedValue?: string
}>(({ className, children, isOpen, setIsOpen, selectedValue, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => setIsOpen?.(!isOpen)}
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, selectedValue }: { placeholder?: string, selectedValue?: string }) => (
  <span className={selectedValue ? "" : "text-muted-foreground"}>
    {selectedValue || placeholder}
  </span>
)

const SelectContent = ({ children, isOpen, onValueChange }: {
  children: React.ReactNode
  isOpen?: boolean
  onValueChange?: (value: string) => void
}) => {
  if (!isOpen) return null

  return (
    <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-md max-h-60 overflow-auto">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            onValueChange
          })
        }
        return child
      })}
    </div>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  value: string
  onValueChange?: (value: string) => void
}>(({ className, children, value, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={() => onValueChange?.(value)}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
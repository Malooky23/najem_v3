import { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface EditableFieldProps<T> {
  label: string
  value: T
  icon?: ReactNode
  isEditing: boolean
  type?: "text" | "number" | "select"
  options?: { value: string; label: string }[]
  onChange: (value: T) => void
  className?: string
}

export function EditableField<T extends string | number>({
  label,
  value,
  icon,
  isEditing,
  type = "text",
  options = [],
  onChange,
  className,
}: EditableFieldProps<T>) {
  const renderEditComponent = () => {
    if (type === "select" && options.length > 0) {
      return (
        <Select value={String(value)} onValueChange={(v) => onChange(v as T)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        type={type}
        value={value}
        onChange={(e) => {
          const newValue = type === "number" 
            ? Number(e.target.value) as T
            : e.target.value as T
          onChange(newValue)
        }}
        min={type === "number" ? "1" : undefined}
      />
    )
  }

  const renderViewComponent = () => (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {icon}
      <span>{type === "select" ? options.find(o => o.value === String(value))?.label : value}</span>
    </div>
  )

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs text-gray-500">{label}</label>
      {isEditing ? renderEditComponent() : renderViewComponent()}
    </div>
  )
}
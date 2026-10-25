import { createContext } from "react"

export interface ButtonGroupContextValue {
  value: string | null
  controls?: string
  select: (value: string) => void
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(
  null,
)

import {
  useContext,
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react"
import { ButtonGroupContext } from "./buttonGroupContext"
import styles from "./atoms.module.css"

export const Button =
  forwardRef<HTMLButtonElement, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
    variant?: "primary" | "secondary" | "danger"
    groupValue?: string
    onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"]
  }>(function Button(
    { variant = "primary", type = "button", groupValue, onClick, ...props },
    ref,
  ) {
    const group = useContext(ButtonGroupContext)
    const isGrouped = group !== null && groupValue !== undefined
    const isActive = isGrouped && group.value === groupValue

    return (
      <button
        ref={ref}
        className={styles.button}
        data-variant={variant}
        data-active={isGrouped ? isActive : undefined}
        aria-pressed={isGrouped ? isActive : undefined}
        type={type}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented && group && groupValue !== undefined) {
            group.select(groupValue)
          }
        }}
        {...props}
      />
    )
  })

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.input} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={styles.select} {...props} />
}

export function Icon({
  src,
  size,
  alt = "",
}: {
  src: string
  size: "small" | "medium"
  alt?: string
}) {
  return <img className={styles.icon} data-size={size} src={src} alt={alt} />
}

export function IconButton({
  label,
  icon,
  onClick,
  expanded,
  controls,
  value,
}: {
  label: string
  icon: ReactNode
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"]
  expanded?: boolean
  controls?: string
  value?: string
}) {
  const group = useContext(ButtonGroupContext)
  const isGrouped = group !== null && value !== undefined
  const isExpanded = isGrouped ? group.value === value : expanded

  return (
    <button
      className={styles.iconButton}
      data-active={isExpanded}
      aria-label={label}
      aria-expanded={isExpanded}
      aria-controls={controls ?? (isGrouped ? group.controls : undefined)}
      type="button"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && group && value !== undefined) {
          group.select(value)
        }
      }}
    >
      {icon}
    </button>
  )
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className={styles.avatar} aria-hidden="true">
      {name.slice(0, 1).toLocaleUpperCase()}
    </span>
  )
}

export function Status({
  children,
  state,
}: {
  children: ReactNode
  state: string
}) {
  return (
    <span className={styles.status} data-state={state}>
      {children}
    </span>
  )
}

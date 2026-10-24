import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react"
import styles from "./atoms.module.css"

export const Button =
  forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger"
  }>(function Button({ variant = "primary", type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={styles.button}
        data-variant={variant}
        type={type}
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
  active,
  onClick,
  expanded,
  controls,
}: {
  label: string
  icon: string
  active?: boolean
  onClick?: () => void
  expanded?: boolean
  controls?: string
}) {
  return (
    <button
      className={styles.iconButton}
      data-active={active}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      type="button"
      onClick={onClick}
    >
      <Icon src={icon} size="small" />
    </button>
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

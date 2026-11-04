import type { ReactNode } from "react"
import styles from "./SidebarPanel.module.css"

export interface SidebarPanelProps {
  ariaLabel: string
  title: string
  description: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

export function SidebarPanel({
  ariaLabel,
  title,
  description,
  closeLabel,
  onClose,
  children,
}: SidebarPanelProps) {
  return (
    <section className={styles.panel} aria-label={ariaLabel}>
      <div className={styles.header}>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <button
          className={styles.close}
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </section>
  )
}

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react"
import { Button } from "../atoms"
import styles from "./organisms.module.css"

export function SplitLayout({
  children,
  aside,
}: {
  children: ReactNode
  aside: ReactNode
}) {
  return (
    <div className={styles.splitLayout}>
      <div className={styles.splitContent}>{children}</div>
      {aside}
    </div>
  )
}

export function ContentSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className={styles.contentSection}>
      <header>
        <span>
          <h2>{title}</h2>
          {description && <small>{description}</small>}
        </span>
      </header>
      {children}
    </section>
  )
}

export function ResponsiveGrid({ children }: { children: ReactNode }) {
  return <div className={styles.responsiveGrid}>{children}</div>
}

export function SidePanel({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <aside className={styles.sidePanel} aria-label={label}>
      {children}
    </aside>
  )
}

export function SignedOutView({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <main className={styles.signedOut}>
      <section className={styles.signedOutCard}>
        <h1>{title}</h1>
        <p>{description}</p>
        <Button onClick={onAction}>{actionLabel}</Button>
      </section>
    </main>
  )
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className={styles.toolbar}>{children}</div>
}

export function CardGrid({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className={styles.grid} role="group" aria-label={label}>
      {children}
    </div>
  )
}

export function ContentCard({
  title,
  children,
  onClick,
  label,
}: {
  title: ReactNode
  children: ReactNode
  onClick?: () => void
  label?: string
}) {
  if (!onClick) {
    return (
      <article className={styles.card}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <div className={styles.cardMeta}>{children}</div>
      </article>
    )
  }
  return (
    <button
      className={styles.card}
      data-interactive="true"
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardMeta}>{children}</span>
    </button>
  )
}

export function EmptyState({
  title,
  description,
  onAction,
  actionLabel,
  icon,
}: {
  title: string
  description: string
  onAction?: () => void
  actionLabel?: string
  icon?: ReactNode
}) {
  return (
    <section className={styles.empty}>
      <div className={styles.emptyContent}>
        {icon}
        <h2>{title}</h2>
        <p>{description}</p>
        {onAction && actionLabel && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </section>
  )
}

export function DetailList({ children }: { children: ReactNode }) {
  return (
    <section className={styles.panel}>
      <dl className={styles.details}>{children}</dl>
    </section>
  )
}

export function Form({
  children,
  onSubmit,
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Save",
}: {
  children: ReactNode
  onSubmit: (event: FormEvent) => void
  onCancel: () => void
  cancelLabel?: string
  submitLabel?: string
}) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.formGrid}>{children}</div>
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}

export function Panel({ children }: { children: ReactNode }) {
  return <section className={styles.panel}>{children}</section>
}

export function ConfirmModal({
  open,
  recordName,
  onCancel,
  onConfirm,
}: {
  open: boolean
  recordName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    return () => previousFocus?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={onCancel}
    >
      <section
        ref={modalRef}
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel()
          if (event.key === "Tab") {
            const buttons =
              modalRef.current?.querySelectorAll<HTMLButtonElement>("button")
            if (!buttons?.length) return
            const first = buttons[0]
            const last = buttons[buttons.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first.focus()
            }
          }
        }}
      >
        <h2 id={titleId}>Excluir registro?</h2>
        <p>
          O registro de {recordName} será removido permanentemente. Esta ação
          não pode ser desfeita.
        </p>
        <div className={styles.modalActions}>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </section>
    </div>
  )
}

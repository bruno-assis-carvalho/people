import type { ReactNode } from "react"
import { Panel, SignedOutView, Toolbar } from "../organisms"
import { Button } from "../atoms"
import styles from "./LandingPageLayout.module.css"
export { AppShell } from "./AppShell"
export type { AppShellProps } from "./AppShell"
export { PageHeader } from "./AppShellFrame"
export type {
  AccountLink,
  AppShellFrameProps,
  BreadcrumbItem,
  NavigationItem,
  SelectionOption,
} from "./AppShellFrame"

export function LandingPageLayout({
  brand,
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  brand: string
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  children: ReactNode
}) {
  return (
    <main className={styles.landing}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label={`${brand} - início`}>
          <span className={styles.brandMark} aria-hidden="true">
            N
          </span>
          {brand}
        </a>
        <Button onClick={onAction}>{actionLabel}</Button>
      </header>

      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="landing-title">{title}</h1>
          <p className={styles.description}>{description}</p>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
        <div className={styles.preview} aria-label="Visão geral da plataforma">
          <div className={styles.previewHeader}>
            <span className={styles.previewDot} />
            <span>Visão geral</span>
            <span className={styles.previewStatus}>Tudo em ordem</span>
          </div>
          <div className={styles.previewContent}>
            <div className={styles.previewHeading}>
              <span className={styles.previewLabel}>Pessoas cadastradas</span>
              <strong>128</strong>
            </div>
            <div className={styles.peopleStack} aria-hidden="true">
              <span>MA</span>
              <span>RC</span>
              <span>JL</span>
              <span>+125</span>
            </div>
            <div className={styles.previewRule} />
            <div className={styles.previewFooter}>
              <span>Informações organizadas</span>
              <span className={styles.previewCheck} aria-hidden="true">
                ✓
              </span>
            </div>
          </div>
          <span className={styles.previewDecoration} aria-hidden="true" />
        </div>
      </section>

      <section className={styles.highlights} aria-label="Benefícios">
        {children}
      </section>
      <footer className={styles.footer}>{brand} · Gestão de pessoas</footer>
    </main>
  )
}

interface ListTemplateProps {
  toolbar?: ReactNode
  children: ReactNode
  isEmpty: boolean
  emptyState: ReactNode
}

export function ListTemplate(props: ListTemplateProps) {
  const { toolbar, children } = props
  return (
    <>
      {toolbar && <Toolbar>{toolbar}</Toolbar>}
      {props.isEmpty ? props.emptyState : children}
    </>
  )
}

export function SignedOutTemplate({
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
    <SignedOutView
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

export function DetailTemplate({
  children,
  actions,
}: {
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <>
      {children}
      {actions && <Toolbar>{actions}</Toolbar>}
    </>
  )
}

export function FormTemplate({ children }: { children: ReactNode }) {
  return <Panel>{children}</Panel>
}

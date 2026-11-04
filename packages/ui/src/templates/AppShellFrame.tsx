import { useEffect, useState, type ReactNode } from "react"
import { Link, useLocation } from "react-router"
import { Avatar, Icon, IconButton, Input } from "../atoms"
import { ButtonGroup } from "../molecules"
import { useHotkeys } from "../keyboard"
import styles from "./AppShell.module.css"
import { SidebarPanel } from "./SidebarPanel"

export interface NavigationItem {
  label: string
  to: string
  icon: string
}

export interface SelectionOption {
  value: string
  label: string
}

export interface AccountLink {
  label: string
  to: string
}

export interface BreadcrumbItem {
  label: string
  to: string
}

export interface AppShellFrameProps {
  brand: ReactNode
  navigationItems: ReadonlyArray<NavigationItem>
  accountName: string
  accountEmail: string
  accountLinks: ReadonlyArray<AccountLink>
  theme: string
  themeOptions: ReadonlyArray<SelectionOption>
  skin: string
  skinOptions: ReadonlyArray<SelectionOption>
  onThemeChange: (value: string) => void
  onSkinChange: (value: string) => void
  breadcrumbs?: BreadcrumbItem[]
  backTo?: string
  feedback?: string
  children: ReactNode
}

export function AppShellFrame({
  brand,
  navigationItems,
  accountName,
  accountEmail,
  accountLinks,
  theme,
  themeOptions,
  skin,
  skinOptions,
  onThemeChange,
  onSkinChange,
  breadcrumbs = [],
  backTo,
  feedback,
  children,
}: AppShellFrameProps) {
  const [activePanel, setActivePanel] =
    useState<"menu" | "account" | "assistant" | null>("menu")
  const [visibleFeedback, setVisibleFeedback] = useState(feedback)
  const location = useLocation()

  useHotkeys({
    "ctrl+1": () => setActivePanel("assistant"),
    "ctrl+2": () => setActivePanel("menu"),
    "ctrl+3": () => setActivePanel("account"),
    "ctrl+x": () => setActivePanel(null),
  })

  useEffect(() => {
    setVisibleFeedback(feedback)
    if (!feedback) return
    const timeout = window.setTimeout(() => setVisibleFeedback(undefined), 4500)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  const isSidebarOpen = activePanel !== null

  return (
    <div
      className={styles.shell}
      data-menu-state={isSidebarOpen ? "open" : "closed"}
    >
      <a className={styles.skipLink} href="#main-content">
        Pular para o conteúdo
      </a>
      <header className={styles.sidebarHeader}>
        <div className={styles.brand}>{brand}</div>
        <ButtonGroup
          label="Ações do usuário"
          value={activePanel}
          onValueChange={(value) => {
            if (
              value === null ||
              value === "assistant" ||
              value === "menu" ||
              value === "account"
            ) {
              setActivePanel(value)
            }
          }}
          controls="application-panel"
          keyboard={{ orientation: "horizontal" }}
        >
          <IconButton
            label="Assistente"
            value="assistant"
            shortcut="Control+1"
            icon={<Icon src="/assets/assistant.svg" size="small" />}
          />
          <IconButton
            label="Menu de aplicativos"
            value="menu"
            shortcut="Control+2"
            icon={<Icon src="/assets/a00ab.svg" size="small" />}
          />
          <IconButton
            label="Opções da conta"
            value="account"
            shortcut="Control+3"
            icon={<Avatar name={accountName} />}
          />
        </ButtonGroup>
      </header>
      <header className={styles.contentHeader}>
        {backTo && (
          <Link className={styles.backButton} to={backTo} aria-label="Voltar">
            ‹
          </Link>
        )}
        {breadcrumbs.length > 0 && (
          <nav className={styles.routeBreadcrumb} aria-label="Migalhas de pão">
            <ol>
              {breadcrumbs.map((breadcrumb, index) => {
                const isCurrent = index === breadcrumbs.length - 1
                return (
                  <li key={`${breadcrumb.to}-${breadcrumb.label}`}>
                    {isCurrent ? (
                      <span aria-current="page">{breadcrumb.label}</span>
                    ) : (
                      <Link to={breadcrumb.to}>{breadcrumb.label}</Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        {visibleFeedback && (
          <aside className={styles.toast} role="status" aria-live="polite">
            <span className={styles.toastMark} aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Notificação</strong>
              <small>{visibleFeedback}</small>
            </span>
            <button
              className={styles.toastClose}
              type="button"
              aria-label="Fechar notificação"
              onClick={() => setVisibleFeedback(undefined)}
            >
              ×
            </button>
          </aside>
        )}
      </header>
      <aside
        id="application-panel"
        className={styles.sidebar}
        data-state={isSidebarOpen ? "open" : "closed"}
        data-panel={activePanel ?? "none"}
        aria-label={
          activePanel === "account"
            ? "Conta e preferências"
            : activePanel === "assistant"
              ? "Assistente"
              : "Menu"
        }
        aria-hidden={!isSidebarOpen}
      >
        {activePanel === "menu" && (
          <SidebarPanel
            ariaLabel="Navegação"
            title="Navegação"
            description="Acesse uma área"
            closeLabel="Fechar navegação"
            onClose={() => setActivePanel(null)}
          >
            <nav className={styles.navIcons}>
              {navigationItems.map((item) => {
                const isCurrent =
                  location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`)
                return (
                  <Link
                    key={item.to}
                    className={styles.navItem}
                    to={item.to}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setActivePanel(null)}
                  >
                    <span className={styles.navIcon}>
                      <Icon src={item.icon} size="medium" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </SidebarPanel>
        )}
        {activePanel === "assistant" && (
          <SidebarPanel
            ariaLabel="Assistente"
            title="Assistente de pessoas"
            description="Orientação contextual para esta tela"
            closeLabel="Fechar assistente"
            onClose={() => setActivePanel(null)}
          >
            <div>

              <p className={styles.chatMessage}>
                Posso ajudar a consultar ou preencher dados de uma pessoa.
              </p>
              <Input
                aria-label="Mensagem para o assistente"
                placeholder="Escreva uma mensagem"
              />
            </div>
          </SidebarPanel>
        )}
        {activePanel === "account" && (
          <SidebarPanel
            ariaLabel="Conta e preferências"
            title="Conta"
            description="Informações e preferências"
            closeLabel="Fechar opções da conta"
            onClose={() => setActivePanel(null)}
          >
            <div className={styles.accountIdentity}>
              <strong>{accountName}</strong>
              <small>{accountEmail}</small>
            </div>
            <div className={styles.themeControl} aria-label="Selecionar tema">
              <span>Tema</span>
              <span>
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-active={theme === option.value}
                    aria-pressed={theme === option.value}
                    onClick={() => onThemeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </span>
            </div>
            <div
              className={styles.themeControl}
              data-options="grid"
              aria-label="Selecionar skin"
            >
              <span>Skin</span>
              <span>
                {skinOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-active={skin === option.value}
                    aria-pressed={skin === option.value}
                    onClick={() => onSkinChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </span>
            </div>
            {accountLinks.map((link) => (
              <Link
                key={link.to}
                className={styles.accountLink}
                to={link.to}
                onClick={() => setActivePanel(null)}
              >
                {link.label}
              </Link>
            ))}
          </SidebarPanel>
        )}
      </aside>
      <main className={styles.main} id="main-content">
        {children}
      </main>
    </div>
  )
}

export function PageHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {action}
    </div>
  )
}

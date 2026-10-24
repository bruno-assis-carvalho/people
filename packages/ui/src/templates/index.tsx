import type { ReactNode } from "react"
import { Panel, SignedOutView, Toolbar } from "../organisms"
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

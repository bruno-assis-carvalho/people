import type { ReactNode } from "react"
import {
  AppShellFrame,
  PageHeader,
  type AppShellFrameProps,
} from "./AppShellFrame"

export interface AppShellProps extends Omit<AppShellFrameProps, "children"> {
  title: string
  headerAction?: ReactNode
  children: ReactNode
}

export function AppShell({
  title,
  headerAction,
  children,
  ...shellProps
}: AppShellProps) {
  return (
    <AppShellFrame {...shellProps}>
      {title && <PageHeader title={title} action={headerAction} />}
      {children}
    </AppShellFrame>
  )
}

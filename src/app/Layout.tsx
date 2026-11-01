import { useEffect, useState } from "react"
import { Outlet, useLocation, useMatches } from "react-router"
import { useAuth0 } from "@auth0/auth0-react"
import type { ReactNode } from "react"
import { AppShell, type BreadcrumbItem } from "@ui"
import { usePeople } from "@/features/people/PeopleProvider"
import { isSkinId, type SkinId } from "./customSkin"
import type { Person } from "@/features/people/types"

interface RouteHandle {
  breadcrumb?: string
  backTo?: string
  title?: string | ((context: RouteTitleContext) => string)
  headerAction?: ReactNode
}

interface RouteTitleContext {
  params: Readonly<Record<string, string | undefined>>
  peopleCount: number
  getPerson: (id: string) => Person | undefined
}

type ThemeMode = "light" | "dark"

const themeOptions = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
]

const skinOptions = [
  { value: "default", label: "Padrão" },
  { value: "newmorphism", label: "Newmorphism" },
  { value: "liquid-glass", label: "Liquid Glass" },
  { value: "neon-glass", label: "Neon Glass" },
  { value: "neon", label: "Neon" },
  { value: "custom", label: "Personalizada" },
]

export default function Layout() {
  const { user } = useAuth0()
  const matches = useMatches()
  const location = useLocation()
  const { storageMessage, people, getPerson } = usePeople()
  const [theme, setTheme] = useState<ThemeMode>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  )
  const [skin, setSkin] = useState<SkinId>(() => {
    const currentSkin = document.documentElement.dataset.skin ?? ""
    return isSkinId(currentSkin) ? currentSkin : "default"
  })
  const [appearanceMessage, setAppearanceMessage] = useState("")
  const routeFeedback = (location.state as { feedback?: string } | null)
    ?.feedback
  const skinWarning = document.documentElement.dataset.skinWarning

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.skin = skin
  }, [skin])

  useEffect(() => {
    const handleSkinChange = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        typeof event.detail === "string" &&
        isSkinId(event.detail)
      ) {
        setSkin(event.detail)
      }
    }
    window.addEventListener("nexus-skin-change", handleSkinChange)
    return () =>
      window.removeEventListener("nexus-skin-change", handleSkinChange)
  }, [])
  const breadcrumbs = matches.flatMap<BreadcrumbItem>((match) => {
    const handle = match.handle as RouteHandle | undefined
    return handle?.breadcrumb
      ? [{ label: handle.breadcrumb, to: match.pathname }]
      : []
  })
  const activeMatch = [...matches].reverse().find((match) => {
    const handle = match.handle as RouteHandle | undefined
    return (
      handle?.title !== undefined ||
      handle?.breadcrumb !== undefined ||
      handle?.backTo !== undefined ||
      handle?.headerAction !== undefined
    )
  })
  const activeHandle = activeMatch?.handle as RouteHandle | undefined
  const titleContext: RouteTitleContext = {
    params: activeMatch?.params ?? {},
    peopleCount: people.length,
    getPerson,
  }
  const pageTitle =
    typeof activeHandle?.title === "function"
      ? activeHandle.title(titleContext)
      : (activeHandle?.title ?? activeHandle?.breadcrumb ?? "")

  return (
    <AppShell
      title={pageTitle}
      headerAction={activeHandle?.headerAction}
      brand="Nexus XP / APIS"
      navigationItems={[
        { label: "Pessoas", to: "/in/people", icon: "/assets/403a2.svg" },
        {
          label: "Editor de skins",
          to: "/in/skin-editor",
          icon: "/assets/fd90f.svg",
        },
      ]}
      accountName={user?.name ?? user?.nickname ?? user?.email ?? "Conta"}
      accountEmail={user?.email ?? ""}
      accountLinks={[
        { label: "Meu perfil", to: "/in/profile" },
        { label: "Sair", to: "/logout" },
      ]}
      theme={theme}
      themeOptions={themeOptions}
      skin={skin}
      skinOptions={skinOptions}
      onThemeChange={(value) => {
        if (value !== "light" && value !== "dark") {
          throw new Error(`Unsupported theme: ${value}`)
        }
        setTheme(value)
        try {
          localStorage.setItem("nexus-theme", value)
          setAppearanceMessage("")
        } catch {
          setAppearanceMessage(
            "O tema foi aplicado nesta sessão, mas não foi salvo neste navegador.",
          )
        }
      }}
      onSkinChange={(value) => {
        if (!isSkinId(value)) throw new Error(`Unsupported skin: ${value}`)
        setSkin(value)
        try {
          localStorage.setItem("nexus-skin", value)
          setAppearanceMessage("")
        } catch {
          setAppearanceMessage(
            "A aparência foi aplicada nesta sessão, mas não foi salva neste navegador.",
          )
        }
      }}
      breadcrumbs={breadcrumbs}
      backTo={activeHandle?.backTo}
      feedback={[routeFeedback, storageMessage, skinWarning, appearanceMessage]
        .filter(Boolean)
        .join(" ")}
    >
      <Outlet />
    </AppShell>
  )
}

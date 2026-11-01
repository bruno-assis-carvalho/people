import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { SignedOutTemplate } from "@ui"

export default function SignedOutPage() {
  const { isAuthenticated, isLoading, logout } = useAuth0()
  const navigate = useNavigate()
  const logoutStarted = useRef(false)
  const [logoutError, setLogoutError] = useState("")
  const signOut = useCallback(() => {
    logoutStarted.current = true
    setLogoutError("")
    void logout({
      logoutParams: { returnTo: `${window.location.origin}/logout` },
    }).catch((error: unknown) => {
      logoutStarted.current = false
      setLogoutError(
        error instanceof Error ? error.message : "Unable to sign out.",
      )
    })
  }, [logout])

  useEffect(() => {
    if (isAuthenticated && !logoutStarted.current) signOut()
  }, [isAuthenticated, isLoading, signOut])

  if ((isLoading || isAuthenticated) && !logoutError) {
    return <main role="status">Signing out…</main>
  }

  return (
    <SignedOutTemplate
      title={logoutError ? "Não foi possível sair" : "Sessão encerrada"}
      description={logoutError || "Você saiu da sua conta com segurança."}
      actionLabel={logoutError ? "Tentar novamente" : "Entrar novamente"}
      onAction={() => {
        if (logoutError && isAuthenticated) {
          signOut()
          return
        }
        navigate("/in/people")
      }}
    />
  )
}

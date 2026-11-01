import { Auth0Provider, useAuth0 } from "@auth0/auth0-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"

export function Auth0ProviderRoute() {
  const navigate = useNavigate()
  const domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim()
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim()

  if (!domain || !clientId) {
    return (
      <main role="alert">
        <h1>Auth0 is not configured</h1>
        <p>
          Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in the local
          environment, then restart the development server.
        </p>
      </main>
    )
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      onRedirectCallback={(appState) => {
        const returnTo = appState?.returnTo
        navigate(
          typeof returnTo === "string" &&
            returnTo.startsWith("/") &&
            !returnTo.startsWith("//")
            ? returnTo
            : "/in",
          { replace: true },
        )
      }}
    >
      <Outlet />
    </Auth0Provider>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { error, isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const location = useLocation()
  const redirectAttempted = useRef(false)
  const [loginError, setLoginError] = useState("")
  const returnTo = `${location.pathname}${location.search}${location.hash}`

  const startLogin = () => {
    redirectAttempted.current = true
    setLoginError("")
    void loginWithRedirect({ appState: { returnTo } }).catch(
      (redirectError: unknown) => {
        redirectAttempted.current = false
        setLoginError(
          redirectError instanceof Error
            ? redirectError.message
            : "Unable to start Auth0 sign-in.",
        )
      },
    )
  }

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !error &&
      !redirectAttempted.current
    ) {
      startLogin()
    }
  }, [error, isAuthenticated, isLoading, loginWithRedirect, returnTo])

  if (error) {
    return (
      <main role="alert">
        <h1>Sign-in failed</h1>
        <p>{error.message}</p>
      </main>
    )
  }

  if (loginError) {
    return (
      <main role="alert">
        <h1>Sign-in failed</h1>
        <p>{loginError}</p>
        <button type="button" onClick={startLogin}>
          Try again
        </button>
      </main>
    )
  }

  if (isLoading || !isAuthenticated) {
    return <main role="status">Checking your sign-in…</main>
  }

  return children
}

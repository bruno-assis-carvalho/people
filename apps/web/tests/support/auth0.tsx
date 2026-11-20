import type { ReactNode } from "react"

const getAccessTokenSilently = async () => "e2e-token"

export function Auth0Provider({ children }: { children: ReactNode }) {
  return children
}

export function useAuth0() {
  return {
    error: undefined,
    isAuthenticated: true,
    isLoading: false,
    user: {
      name: "Test User",
      email: "test@example.com",
    },
    getAccessTokenSilently,
    loginWithRedirect: async () => {},
  }
}

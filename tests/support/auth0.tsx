import type { ReactNode } from "react"

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
    loginWithRedirect: async () => {},
  }
}

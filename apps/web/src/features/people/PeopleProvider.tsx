import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useAuth0 } from "@auth0/auth0-react"
import type { Person, PersonInput } from "./types"

const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "")
const API_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

interface PeopleContextValue {
  people: Person[]
  isLoading: boolean
  errorMessage?: string
  createPerson: (input: PersonInput) => Promise<Person | undefined>
  updatePerson: (id: string, input: PersonInput) => Promise<boolean>
  deletePerson: (id: string) => Promise<boolean>
  getPerson: (id: string) => Person | undefined
}

const PeopleContext = createContext<PeopleContextValue | null>(null)

async function getErrorMessage(response: Response) {
  const body = await response.text()
  if (body) {
    try {
      const payload: unknown = JSON.parse(body)
      if (
        typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
      ) {
        return payload.message
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
    }
  }
  return `A API não conseguiu concluir a solicitação (${response.status}).`
}

export function PeopleProvider({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently } = useAuth0()
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const request = useCallback(
    async <T,>(
      path: string,
      options: RequestInit = {},
    ): Promise<T | undefined> => {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: API_AUDIENCE
          ? { audience: API_AUDIENCE }
          : undefined,
      })
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }
      if (response.status === 204) return undefined
      return (await response.json()) as T
    },
    [getAccessTokenSilently],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    request<Person[]>("/people")
      .then((result) => {
        if (active && result) {
          setPeople(result)
          setErrorMessage(undefined)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as pessoas.",
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [request])

  const createPerson = useCallback(
    async (input: PersonInput) => {
      try {
        const person = await request<Person>("/people", {
          method: "POST",
          body: JSON.stringify(input),
        })
        if (!person) throw new Error("A API não retornou a pessoa criada.")
        setPeople((current) => [...current, person])
        setErrorMessage(undefined)
        return person
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar a pessoa.",
        )
        return undefined
      }
    },
    [request],
  )

  const updatePerson = useCallback(
    async (id: string, input: PersonInput) => {
      try {
        const person = await request<Person>(`/people/${id}`, {
          method: "PUT",
          body: JSON.stringify(input),
        })
        if (!person) throw new Error("A API não retornou a pessoa atualizada.")
        setPeople((current) =>
          current.map((item) => (item.id === id ? person : item)),
        )
        setErrorMessage(undefined)
        return true
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a pessoa.",
        )
        return false
      }
    },
    [request],
  )

  const deletePerson = useCallback(
    async (id: string) => {
      try {
        await request<void>(`/people/${id}`, { method: "DELETE" })
        setPeople((current) => current.filter((person) => person.id !== id))
        setErrorMessage(undefined)
        return true
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a pessoa.",
        )
        return false
      }
    },
    [request],
  )

  const getPerson = useCallback(
    (id: string) => people.find((person) => person.id === id),
    [people],
  )

  const value = useMemo(
    () => ({
      people,
      isLoading,
      errorMessage,
      createPerson,
      updatePerson,
      deletePerson,
      getPerson,
    }),
    [
      people,
      isLoading,
      errorMessage,
      createPerson,
      updatePerson,
      deletePerson,
      getPerson,
    ],
  )

  return (
    <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>
  )
}

export function usePeople() {
  const context = useContext(PeopleContext)
  if (!context) throw new Error("usePeople must be used inside PeopleProvider")
  return context
}

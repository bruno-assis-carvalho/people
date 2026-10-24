import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { Person, PersonInput } from "./types"

const STORAGE_KEY = "nexus-people"

const seedPeople: Person[] = [
  {
    id: "marina-costa",
    name: "Marina Costa",
    email: "marina.costa@email.com",
    phone: "(11) 98765-4321",
    document: "123.456.789-00",
    birthDate: "1991-08-14",
    city: "São Paulo, SP",
    status: "Ativo",
  },
  {
    id: "andre-santos",
    name: "André Santos",
    email: "andre.santos@email.com",
    phone: "(21) 99876-5432",
    document: "987.654.321-00",
    birthDate: "1987-03-22",
    city: "Rio de Janeiro, RJ",
    status: "Ativo",
  },
  {
    id: "luciana-rocha",
    name: "Luciana Rocha",
    email: "luciana.rocha@email.com",
    phone: "(31) 97654-3210",
    document: "456.789.123-00",
    birthDate: "1995-11-05",
    city: "Belo Horizonte, MG",
    status: "Inativo",
  },
]

interface PeopleContextValue {
  people: Person[]
  storageMessage?: string
  createPerson: (input: PersonInput) => Person
  updatePerson: (id: string, input: PersonInput) => void
  deletePerson: (id: string) => void
  getPerson: (id: string) => Person | undefined
}

const PeopleContext = createContext<PeopleContextValue | null>(null)

interface PeopleReadResult {
  people: Person[]
  storageMessage?: string
}

function isPerson(value: unknown): value is Person {
  if (typeof value !== "object" || value === null) return false
  const person = value as Record<string, unknown>
  return (
    typeof person.id === "string" &&
    typeof person.name === "string" &&
    typeof person.email === "string" &&
    typeof person.phone === "string" &&
    typeof person.document === "string" &&
    typeof person.birthDate === "string" &&
    typeof person.city === "string" &&
    (person.status === "Ativo" || person.status === "Inativo")
  )
}

function readPeople(): PeopleReadResult {
  let stored: string | null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    return {
      people: seedPeople,
      storageMessage:
        "Não foi possível ler os registros salvos neste navegador.",
    }
  }

  if (stored === null) return { people: seedPeople }

  try {
    const parsed: unknown = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.every(isPerson)) {
      return { people: parsed }
    }
  } catch {
    return {
      people: seedPeople,
      storageMessage:
        "Os registros salvos estão inválidos. Os dados de exemplo foram carregados.",
    }
  }

  return {
    people: seedPeople,
    storageMessage:
      "Os registros salvos estão inválidos. Os dados de exemplo foram carregados.",
  }
}

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(readPeople)
  const { people, storageMessage } = data

  const persist = useCallback((next: Person[]) => {
    let nextStorageMessage: string | undefined
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      nextStorageMessage =
        "As alterações estão disponíveis nesta sessão, mas não puderam ser salvas neste navegador."
    }
    setData({ people: next, storageMessage: nextStorageMessage })
  }, [])

  const createPerson = useCallback(
    (input: PersonInput) => {
      const person = { ...input, id: crypto.randomUUID() }
      persist([...people, person])
      return person
    },
    [people, persist],
  )

  const updatePerson = useCallback(
    (id: string, input: PersonInput) => {
      persist(
        people.map((person) => (person.id === id ? { ...input, id } : person)),
      )
    },
    [people, persist],
  )

  const deletePerson = useCallback(
    (id: string) => persist(people.filter((person) => person.id !== id)),
    [people, persist],
  )

  const getPerson = useCallback(
    (id: string) => people.find((person) => person.id === id),
    [people],
  )

  const value = useMemo(
    () => ({
      people,
      storageMessage,
      createPerson,
      updatePerson,
      deletePerson,
      getPerson,
    }),
    [
      people,
      storageMessage,
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

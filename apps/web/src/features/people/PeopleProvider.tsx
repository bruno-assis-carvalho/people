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
const mockFirstNames = [
  "Alexandre",
  "Bianca",
  "Caio",
  "Débora",
  "Enzo",
  "Flávia",
  "Heitor",
  "Ingrid",
  "João",
  "Kelly",
]
const mockLastNames = [
  "Araújo",
  "Batista",
  "Campos",
  "Duarte",
  "Esteves",
  "Farias",
  "Gomes",
  "Lopes",
  "Melo",
  "Pereira",
]
const mockCities = [
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Curitiba, PR",
  "Salvador, BA",
  "Recife, PE",
  "Fortaleza, CE",
  "Goiânia, GO",
  "Vitória, ES",
  "Manaus, AM",
  "Florianópolis, SC",
]

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
  {
    id: "rafaela-lima",
    name: "Rafaela Lima",
    email: "rafaela.lima@example.com",
    phone: "(41) 98765-1004",
    document: "000.000.000-04",
    birthDate: "1990-04-15",
    city: "Curitiba, PR",
    status: "Ativo",
  },
  {
    id: "bruno-almeida",
    name: "Bruno Almeida",
    email: "bruno.almeida@example.com",
    phone: "(51) 98765-1005",
    document: "000.000.000-05",
    birthDate: "1988-09-27",
    city: "Porto Alegre, RS",
    status: "Ativo",
  },
  {
    id: "camila-ferreira",
    name: "Camila Ferreira",
    email: "camila.ferreira@example.com",
    phone: "(61) 98765-1006",
    document: "000.000.000-06",
    birthDate: "1992-06-18",
    city: "Brasília, DF",
    status: "Inativo",
  },
  {
    id: "pedro-oliveira",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@example.com",
    phone: "(71) 98765-1007",
    document: "000.000.000-07",
    birthDate: "1985-01-09",
    city: "Salvador, BA",
    status: "Ativo",
  },
  {
    id: "beatriz-martins",
    name: "Beatriz Martins",
    email: "beatriz.martins@example.com",
    phone: "(81) 98765-1008",
    document: "000.000.000-08",
    birthDate: "1996-12-03",
    city: "Recife, PE",
    status: "Ativo",
  },
  {
    id: "gabriel-rodrigues",
    name: "Gabriel Rodrigues",
    email: "gabriel.rodrigues@example.com",
    phone: "(85) 98765-1009",
    document: "000.000.000-09",
    birthDate: "1993-07-21",
    city: "Fortaleza, CE",
    status: "Inativo",
  },
  {
    id: "isabela-nunes",
    name: "Isabela Nunes",
    email: "isabela.nunes@example.com",
    phone: "(62) 98765-1010",
    document: "000.000.000-10",
    birthDate: "1998-02-11",
    city: "Goiânia, GO",
    status: "Ativo",
  },
  {
    id: "thiago-barbosa",
    name: "Thiago Barbosa",
    email: "thiago.barbosa@example.com",
    phone: "(27) 98765-1011",
    document: "000.000.000-11",
    birthDate: "1989-10-30",
    city: "Vitória, ES",
    status: "Ativo",
  },
  {
    id: "larissa-ribeiro",
    name: "Larissa Ribeiro",
    email: "larissa.ribeiro@example.com",
    phone: "(92) 98765-1012",
    document: "000.000.000-12",
    birthDate: "1994-05-07",
    city: "Manaus, AM",
    status: "Inativo",
  },
  {
    id: "felipe-cardoso",
    name: "Felipe Cardoso",
    email: "felipe.cardoso@example.com",
    phone: "(98) 98765-1013",
    document: "000.000.000-13",
    birthDate: "1986-08-19",
    city: "São Luís, MA",
    status: "Ativo",
  },
  {
    id: "mariana-teixeira",
    name: "Mariana Teixeira",
    email: "mariana.teixeira@example.com",
    phone: "(91) 98765-1014",
    document: "000.000.000-14",
    birthDate: "1997-03-26",
    city: "Belém, PA",
    status: "Ativo",
  },
  {
    id: "eduardo-mendes",
    name: "Eduardo Mendes",
    email: "eduardo.mendes@example.com",
    phone: "(48) 98765-1015",
    document: "000.000.000-15",
    birthDate: "1984-11-13",
    city: "Florianópolis, SC",
    status: "Inativo",
  },
  {
    id: "julia-cavalcanti",
    name: "Júlia Cavalcanti",
    email: "julia.cavalcanti@example.com",
    phone: "(65) 98765-1016",
    document: "000.000.000-16",
    birthDate: "1999-01-31",
    city: "Cuiabá, MT",
    status: "Ativo",
  },
  {
    id: "ricardo-freitas",
    name: "Ricardo Freitas",
    email: "ricardo.freitas@example.com",
    phone: "(69) 98765-1017",
    document: "000.000.000-17",
    birthDate: "1982-06-24",
    city: "Porto Velho, RO",
    status: "Ativo",
  },
  {
    id: "aline-moreira",
    name: "Aline Moreira",
    email: "aline.moreira@example.com",
    phone: "(95) 98765-1018",
    document: "000.000.000-18",
    birthDate: "1991-09-02",
    city: "Boa Vista, RR",
    status: "Inativo",
  },
  {
    id: "daniel-castro",
    name: "Daniel Castro",
    email: "daniel.castro@example.com",
    phone: "(79) 98765-1019",
    document: "000.000.000-19",
    birthDate: "1987-12-16",
    city: "Aracaju, SE",
    status: "Ativo",
  },
  {
    id: "leticia-pires",
    name: "Letícia Pires",
    email: "leticia.pires@example.com",
    phone: "(83) 98765-1020",
    document: "000.000.000-20",
    birthDate: "1995-04-08",
    city: "João Pessoa, PB",
    status: "Ativo",
  },
  {
    id: "vinicius-moura",
    name: "Vinícius Moura",
    email: "vinicius.moura@example.com",
    phone: "(84) 98765-1021",
    document: "000.000.000-21",
    birthDate: "1990-07-12",
    city: "Natal, RN",
    status: "Inativo",
  },
  {
    id: "patricia-dias",
    name: "Patrícia Dias",
    email: "patricia.dias@example.com",
    phone: "(86) 98765-1022",
    document: "000.000.000-22",
    birthDate: "1983-02-28",
    city: "Teresina, PI",
    status: "Ativo",
  },
  {
    id: "gustavo-azevedo",
    name: "Gustavo Azevedo",
    email: "gustavo.azevedo@example.com",
    phone: "(63) 98765-1023",
    document: "000.000.000-23",
    birthDate: "1996-10-05",
    city: "Palmas, TO",
    status: "Ativo",
  },
  {
    id: "fernanda-lopes",
    name: "Fernanda Lopes",
    email: "fernanda.lopes@example.com",
    phone: "(67) 98765-1024",
    document: "000.000.000-24",
    birthDate: "1989-05-17",
    city: "Campo Grande, MS",
    status: "Inativo",
  },
  {
    id: "mateus-fernandes",
    name: "Mateus Fernandes",
    email: "mateus.fernandes@example.com",
    phone: "(65) 98765-1025",
    document: "000.000.000-25",
    birthDate: "1993-11-22",
    city: "Várzea Grande, MT",
    status: "Ativo",
  },
  ...Array.from({ length: 100 }, (_, index): Person => {
    const sequence = index + 26
    const document = String(100_000_000 + index).padStart(11, "0")

    return {
      id: `mock-person-${String(sequence).padStart(3, "0")}`,
      name: `${mockFirstNames[index % mockFirstNames.length]} ${mockLastNames[Math.floor(index / mockFirstNames.length)]}`,
      email: `pessoa.${String(sequence).padStart(3, "0")}@example.com`,
      phone: `(11) 98765-${String(1000 + sequence).padStart(4, "0")}`,
      document: `${document.slice(0, 3)}.${document.slice(3, 6)}.${document.slice(6, 9)}-${document.slice(9)}`,
      birthDate: `19${80 + (index % 20)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
      city: mockCities[index % mockCities.length],
      status: index % 4 === 0 ? "Inativo" : "Ativo",
    }
  }),
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

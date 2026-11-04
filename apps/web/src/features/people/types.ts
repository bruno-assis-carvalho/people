export type PersonStatus = "Ativo" | "Inativo"

export interface Person {
  id: string
  name: string
  email: string
  phone: string
  document: string
  birthDate: string
  city: string
  status: PersonStatus
}

export type PersonInput = Omit<Person, "id">

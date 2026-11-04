import { act, cleanup, renderHook } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PeopleProvider, usePeople } from "./PeopleProvider"
import type { Person, PersonInput } from "./types"

const storageKey = "nexus-people"

const personInput: PersonInput = {
  name: "Rafaela Lima",
  email: "rafaela.lima@email.com",
  phone: "(11) 99999-1234",
  document: "123.123.123-12",
  birthDate: "1990-04-15",
  city: "São Paulo, SP",
  status: "Ativo",
}

const wrapper = ({ children }: PropsWithChildren) => (
  <PeopleProvider>{children}</PeopleProvider>
)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe("PeopleProvider", () => {
  it("loads the example people when storage is empty", () => {
    const { result } = renderHook(() => usePeople(), { wrapper })

    expect(result.current.people).toHaveLength(125)
    expect(new Set(result.current.people.map(({ id }) => id)).size).toBe(125)
    expect(result.current.people.map(({ name }) => name)).toContain(
      "Marina Costa",
    )
    expect(localStorage.getItem(storageKey)).toBeNull()
  })

  it("loads saved people instead of the examples", () => {
    const savedPerson: Person = { ...personInput, id: "saved-person" }
    localStorage.setItem(storageKey, JSON.stringify([savedPerson]))

    const { result } = renderHook(() => usePeople(), { wrapper })

    expect(result.current.people).toEqual([savedPerson])
    expect(result.current.getPerson(savedPerson.id)).toEqual(savedPerson)
  })

  it("creates, updates, and deletes people while persisting each change", () => {
    const { result } = renderHook(() => usePeople(), { wrapper })
    let createdId = ""

    act(() => {
      createdId = result.current.createPerson(personInput).id
    })

    expect(createdId).toBeTruthy()
    expect(result.current.getPerson(createdId)).toMatchObject(personInput)
    expect(JSON.parse(localStorage.getItem(storageKey) ?? "[]")).toContainEqual(
      { ...personInput, id: createdId },
    )

    const updatedPerson = { ...personInput, city: "Curitiba, PR" }
    act(() => result.current.updatePerson(createdId, updatedPerson))

    expect(result.current.getPerson(createdId)).toEqual({
      ...updatedPerson,
      id: createdId,
    })

    act(() => result.current.deletePerson(createdId))

    expect(result.current.getPerson(createdId)).toBeUndefined()
    expect(
      JSON.parse(localStorage.getItem(storageKey) ?? "[]"),
    ).not.toContainEqual(expect.objectContaining({ id: createdId }))
  })

  it("falls back to example people and reports invalid saved data", () => {
    localStorage.setItem(storageKey, "not-json")

    const { result } = renderHook(() => usePeople(), { wrapper })

    expect(result.current.people).toHaveLength(125)
    expect(result.current.storageMessage).toContain(
      "Os registros salvos estão inválidos",
    )
  })

  it("reports when saved data cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable")
    })

    const { result } = renderHook(() => usePeople(), { wrapper })

    expect(result.current.people).toHaveLength(125)
    expect(result.current.storageMessage).toBe(
      "Não foi possível ler os registros salvos neste navegador.",
    )
  })

  it("keeps changes in the session and reports when persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable")
    })

    const { result } = renderHook(() => usePeople(), { wrapper })

    act(() => result.current.createPerson(personInput))

    expect(result.current.people).toHaveLength(126)
    expect(result.current.storageMessage).toBe(
      "As alterações estão disponíveis nesta sessão, mas não puderam ser salvas neste navegador.",
    )
  })
})

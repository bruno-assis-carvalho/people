import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PeopleProvider, usePeople } from "./PeopleProvider"
import type { Person, PersonInput } from "./types"

const { getAccessTokenSilently } = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn(async () => "test-access-token"),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently }),
}))

const personInput: PersonInput = {
  name: "Rafaela Lima",
  email: "rafaela.lima@email.com",
  phone: "(11) 99999-1234",
  document: "123.123.123-12",
  birthDate: "1990-04-15",
  city: "São Paulo, SP",
  status: "Ativo",
}

const person: Person = { ...personInput, id: "person-1" }
const wrapper = ({ children }: PropsWithChildren) => (
  <PeopleProvider>{children}</PeopleProvider>
)

function apiResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("PeopleProvider", () => {
  it("loads people and performs CRUD through authenticated API resources", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(apiResponse([person]))
      .mockResolvedValueOnce(apiResponse({ ...person, id: "person-2" }, 201))
      .mockResolvedValueOnce(
        apiResponse({ ...person, id: "person-2", city: "Curitiba, PR" }),
      )
      .mockResolvedValueOnce(apiResponse(undefined, 204))
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => usePeople(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.people).toEqual([person])
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/people",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      }),
    )

    let created: Person | undefined
    await act(async () => {
      created = await result.current.createPerson(personInput)
    })
    expect(created?.id).toBe("person-2")

    await act(async () => {
      await result.current.updatePerson("person-2", {
        ...personInput,
        city: "Curitiba, PR",
      })
    })
    expect(result.current.getPerson("person-2")?.city).toBe("Curitiba, PR")

    await act(async () => {
      await result.current.deletePerson("person-2")
    })
    expect(result.current.getPerson("person-2")).toBeUndefined()
    expect(fetchMock.mock.calls.map(([url, options]) => [url, options?.method]))
      .toEqual([
        ["/api/people", undefined],
        ["/api/people", "POST"],
        ["/api/people/person-2", "PUT"],
        ["/api/people/person-2", "DELETE"],
      ])
  })

  it("exposes API failures instead of substituting local example data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        apiResponse({ message: "Unauthorized", code: "UNAUTHORIZED" }, 401),
      ),
    )

    const { result } = renderHook(() => usePeople(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.people).toEqual([])
    expect(result.current.errorMessage).toBe("Unauthorized")
  })
})

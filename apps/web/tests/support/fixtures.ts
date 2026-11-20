import { test as base, expect } from "@playwright/test"
import { seedPeople } from "../../../../packages/mocks/src/people"

export { expect }

export const test = base.extend({
  page: async ({ page }, use) => {
    let people = seedPeople.map((person) => ({ ...person }))
    let nextId = 0

    await page.route("**/api/people**", async (route) => {
      const request = route.request()
      if (request.headers().authorization !== "Bearer e2e-token") {
        await route.fulfill({
          status: 401,
          json: { message: "Unauthorized", code: "UNAUTHORIZED" },
        })
        return
      }

      const url = new URL(request.url())
      const personId = url.pathname.match(/^\/api\/people\/([^/]+)$/)?.[1]

      if (request.method() === "GET" && !personId) {
        await route.fulfill({ json: people })
        return
      }

      if (request.method() === "POST" && !personId) {
        const person = {
          ...request.postDataJSON(),
          id: `e2e-person-${++nextId}`,
        }
        people = [...people, person]
        await route.fulfill({ status: 201, json: person })
        return
      }

      const personIndex = people.findIndex(({ id }) => id === personId)
      if (personIndex === -1) {
        await route.fulfill({
          status: 404,
          json: { message: "Person not found", code: "PERSON_NOT_FOUND" },
        })
        return
      }

      if (request.method() === "PUT") {
        const person = { ...request.postDataJSON(), id: personId }
        people = people.map((item, index) =>
          index === personIndex ? person : item,
        )
        await route.fulfill({ json: person })
        return
      }

      if (request.method() === "DELETE") {
        people = people.filter(({ id }) => id !== personId)
        await route.fulfill({ status: 204 })
        return
      }

      await route.fulfill({ status: 405 })
    })

    await use(page)
  },
})

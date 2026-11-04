import { expect, test } from "@playwright/test"

test("public landing page introduces the people management app", async ({
  page,
}) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Pessoas no centro de tudo." }),
  ).toBeVisible()

  const benefits = page.getByRole("region", { name: "Benefícios" })
  await expect(benefits).toContainText("Tudo em um só lugar")
  await expect(benefits).toContainText("Organização sem esforço")
  await expect(benefits).toContainText("Feito para sua equipe")
  await expect(page.getByRole("button", { name: "Entrar" })).toHaveCount(2)
})

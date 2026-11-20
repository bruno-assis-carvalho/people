import { expect, test } from "@playwright/test"

test("completes the people CRUD lifecycle through the UI", async ({ page }) => {
  const suffix = Date.now()
  const name = `Playwright CRUD ${suffix}`
  const email = `playwright-crud-${suffix}@example.com`

  await page.goto("/in/people")
  await page.getByRole("button", { name: "＋ Adicionar pessoa" }).click()

  await page.getByLabel("Nome completo").fill(name)
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Telefone").fill("(11) 99999-1234")
  await page.getByLabel("CPF").fill("321.654.987-00")
  await page.getByLabel("Data de nascimento").fill("1990-03-15")
  await page.getByLabel("Cidade").fill("São Paulo, SP")
  await page.getByLabel("Situação").selectOption("Inativo")
  await page.getByRole("button", { name: "Salvar pessoa" }).click()

  await expect(page).toHaveURL(/\/in\/people\/[^/]+$/)
  await expect(page.getByRole("heading", { name })).toBeVisible()
  await expect(page.getByText("Pessoa adicionada com sucesso.")).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
  await expect(page.getByText("(11) 99999-1234")).toBeVisible()
  await expect(page.getByText("321.654.987-00")).toBeVisible()
  await expect(page.getByText("15/03/1990")).toBeVisible()
  await expect(page.getByText("São Paulo, SP")).toBeVisible()
  await expect(page.getByText("Inativo", { exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByRole("heading", { name })).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()

  await page.getByRole("button", { name: "Editar pessoa" }).click()
  await expect(page.getByLabel("Nome completo")).toHaveValue(name)
  await page.getByLabel("Cidade").fill("Curitiba, PR")
  await page.getByRole("button", { name: "Salvar pessoa" }).click()

  await expect(page.getByText("Dados atualizados com sucesso.")).toBeVisible()
  await expect(page.getByText("Curitiba, PR")).toBeVisible()

  await page.reload()
  await expect(page.getByText("Curitiba, PR")).toBeVisible()

  await page.getByRole("button", { name: "Excluir registro" }).click()
  const confirmation = page.getByRole("alertdialog")
  await expect(confirmation).toContainText(
    `O registro de ${name} será removido permanentemente.`,
  )
  await confirmation.getByRole("button", { name: "Cancelar" }).click()
  await expect(confirmation).toBeHidden()
  await expect(page.getByRole("heading", { name })).toBeVisible()

  await page.getByRole("button", { name: "Excluir registro" }).click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Excluir" })
    .click()

  await expect(page).toHaveURL(/\/in\/people$/)
  await expect(page.getByText("Pessoa excluída com sucesso.")).toBeVisible()
  await page.getByRole("searchbox", { name: "Consultar pessoas" }).fill(email)
  await expect(
    page.getByRole("button", { name: `Ver dados de ${name}` }),
  ).toHaveCount(0)

  await page.reload()
  await page.getByRole("searchbox", { name: "Consultar pessoas" }).fill(email)
  await expect(
    page.getByRole("button", { name: `Ver dados de ${name}` }),
  ).toHaveCount(0)
})

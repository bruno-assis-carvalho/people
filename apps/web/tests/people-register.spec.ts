import { expect, test } from "@playwright/test"

test("registers a person and shows the saved details", async ({ page }) => {
  await page.goto("/in/people")
  await page.getByRole("button", { name: "＋ Adicionar pessoa" }).click()

  await page.getByLabel("Nome completo").fill("Camila Ferreira")
  await page.getByLabel("E-mail").fill("camila.ferreira@example.com")
  await page.getByLabel("Telefone").fill("(11) 99999-0001")
  await page.getByLabel("CPF").fill("111.222.333-44")
  await page.getByLabel("Data de nascimento").fill("1992-06-18")
  await page.getByLabel("Cidade").fill("São Paulo, SP")
  await page.getByLabel("Situação").selectOption("Inativo")
  await page.getByRole("button", { name: "Salvar pessoa" }).click()

  await expect(
    page.getByRole("heading", { name: "Camila Ferreira" }),
  ).toBeVisible()
  await expect(page.getByText("Pessoa adicionada com sucesso.")).toBeVisible()
  await expect(page.getByText("camila.ferreira@example.com")).toBeVisible()
  await expect(page.getByText("18/06/1992")).toBeVisible()
  await expect(page.getByText("São Paulo, SP")).toBeVisible()
  await expect(page.getByText("Inativo", { exact: true })).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Camila Ferreira" }),
  ).toBeVisible()
  await expect(page.getByText("camila.ferreira@example.com")).toBeVisible()
})

test("requires the mandatory person fields before saving", async ({ page }) => {
  await page.goto("/in/people/create")

  await page.getByRole("button", { name: "Salvar pessoa" }).click()

  await expect(page).toHaveURL(/\/in\/people\/create$/)
  await expect(page.getByLabel("Nome completo")).toBeFocused()
})

test("updates a registered person's details", async ({ page }) => {
  await page.goto("/in/people")
  await page.getByRole("button", { name: "Ver dados de Marina Costa" }).click()
  await page.getByRole("button", { name: "Editar pessoa" }).click()

  await expect(page.getByLabel("Nome completo")).toHaveValue("Marina Costa")
  await page.getByLabel("Cidade").fill("Curitiba, PR")
  await page.getByRole("button", { name: "Salvar pessoa" }).click()

  await expect(page.getByText("Dados atualizados com sucesso.")).toBeVisible()
  await expect(page.getByText("Curitiba, PR")).toBeVisible()
})

test("cancels then confirms deletion of a person", async ({ page }) => {
  await page.goto("/in/people")
  await page.getByRole("button", { name: "Ver dados de Luciana Rocha" }).click()
  await page.getByRole("button", { name: "Excluir registro" }).click()

  const confirmation = page.getByRole("alertdialog")
  await expect(confirmation).toContainText(
    "O registro de Luciana Rocha será removido permanentemente.",
  )
  await confirmation.getByRole("button", { name: "Cancelar" }).click()
  await expect(confirmation).toBeHidden()
  await expect(
    page.getByRole("heading", { name: "Luciana Rocha" }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Excluir registro" }).click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Excluir" })
    .click()

  await expect(page).toHaveURL(/\/in\/people$/)
  await expect(page.getByText("Pessoa excluída com sucesso.")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Pessoas cadastradas (124)" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Ver dados de Luciana Rocha" }),
  ).toHaveCount(0)
})

test("filters the people list by a case-insensitive name", async ({ page }) => {
  await page.goto("/in/people")
  await page
    .getByRole("searchbox", { name: "Consultar pessoas" })
    .fill("MARINA")

  await expect(
    page.getByRole("button", { name: "Ver dados de Marina Costa" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Ver dados de André Santos" }),
  ).toHaveCount(0)
})

test("loads more people cards as the list is scrolled", async ({ page }) => {
  await page.goto("/in/people")
  const peopleGrid = page.getByRole("group", { name: "Pessoas cadastradas" })

  await expect(
    peopleGrid.getByRole("button", { name: /Ver dados de/ }),
  ).toHaveCount(20)
  await page
    .getByRole("button", { name: "Carregar mais" })
    .scrollIntoViewIfNeeded()
  await expect(
    peopleGrid.getByRole("button", { name: /Ver dados de/ }),
  ).toHaveCount(40)
})

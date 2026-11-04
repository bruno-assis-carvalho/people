import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router"
import { AppShellFrame } from "./AppShellFrame"

afterEach(cleanup)

describe("AppShellFrame shortcuts", () => {
  it("renders a reusable panel header and closes the panel", () => {
    render(
      <MemoryRouter>
        <AppShellFrame
          brand="Nexus"
          navigationItems={[]}
          accountName="Avery"
          accountEmail="avery@example.com"
          accountLinks={[]}
          theme="light"
          themeOptions={[]}
          skin="default"
          skinOptions={[]}
          onThemeChange={() => {}}
          onSkinChange={() => {}}
        >
          <div>Page</div>
        </AppShellFrame>
      </MemoryRouter>,
    )

    expect(screen.getByRole("region", { name: "Navegação" })).toBeTruthy()
    expect(screen.getByText("Acesse uma área")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Fechar navegação" }))

    expect(
      document.querySelector("#application-panel")?.getAttribute("data-panel"),
    ).toBe("none")
  })

  it.each([
    ["1", "assistant"],
    ["2", "menu"],
    ["3", "account"],
  ])("Ctrl+%s opens the %s panel", (key, panel) => {
    render(
      <MemoryRouter>
        <AppShellFrame
          brand="Nexus"
          navigationItems={[]}
          accountName="Avery"
          accountEmail="avery@example.com"
          accountLinks={[]}
          theme="light"
          themeOptions={[]}
          skin="default"
          skinOptions={[]}
          onThemeChange={() => {}}
          onSkinChange={() => {}}
        >
          <div>Page</div>
        </AppShellFrame>
      </MemoryRouter>,
    )

    fireEvent.keyDown(window, { key, ctrlKey: true })

    expect(screen.getByRole("complementary").getAttribute("data-panel")).toBe(
      panel,
    )
  })

  it("does not switch panels while typing in an editable field", () => {
    render(
      <MemoryRouter>
        <AppShellFrame
          brand="Nexus"
          navigationItems={[]}
          accountName="Avery"
          accountEmail="avery@example.com"
          accountLinks={[]}
          theme="light"
          themeOptions={[]}
          skin="default"
          skinOptions={[]}
          onThemeChange={() => {}}
          onSkinChange={() => {}}
        >
          <div>Page</div>
        </AppShellFrame>
      </MemoryRouter>,
    )

    fireEvent.keyDown(window, { key: "1", ctrlKey: true })
    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "2",
      ctrlKey: true,
    })

    expect(screen.getByRole("complementary").getAttribute("data-panel")).toBe(
      "assistant",
    )
  })

  it("Ctrl+X closes the open panel", () => {
    render(
      <MemoryRouter>
        <AppShellFrame
          brand="Nexus"
          navigationItems={[]}
          accountName="Avery"
          accountEmail="avery@example.com"
          accountLinks={[]}
          theme="light"
          themeOptions={[]}
          skin="default"
          skinOptions={[]}
          onThemeChange={() => {}}
          onSkinChange={() => {}}
        >
          <div>Page</div>
        </AppShellFrame>
      </MemoryRouter>,
    )

    fireEvent.keyDown(window, { key: "x", ctrlKey: true })

    expect(
      document.querySelector("#application-panel")?.getAttribute("data-panel"),
    ).toBe("none")
  })

  it("does not close the panel when Ctrl+X is pressed in an editable field", () => {
    render(
      <MemoryRouter>
        <AppShellFrame
          brand="Nexus"
          navigationItems={[]}
          accountName="Avery"
          accountEmail="avery@example.com"
          accountLinks={[]}
          theme="light"
          themeOptions={[]}
          skin="default"
          skinOptions={[]}
          onThemeChange={() => {}}
          onSkinChange={() => {}}
        >
          <div>Page</div>
        </AppShellFrame>
      </MemoryRouter>,
    )

    fireEvent.keyDown(window, { key: "1", ctrlKey: true })
    fireEvent.keyDown(
      screen.getByRole("textbox", { name: "Mensagem para o assistente" }),
      {
        key: "x",
        ctrlKey: true,
      },
    )

    expect(
      document.querySelector("#application-panel")?.getAttribute("data-panel"),
    ).toBe("assistant")
  })
})

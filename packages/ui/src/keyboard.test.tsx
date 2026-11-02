import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ButtonGroup } from "./molecules"
import { Button } from "./atoms"
import { useHotkeys } from "./keyboard"

afterEach(cleanup)

describe("ButtonGroup keyboard navigation", () => {
  it("uses arrow keys, Home, and End to move focus and wraps by default", () => {
    render(
      <ButtonGroup label="Actions" keyboard={{ orientation: "horizontal" }}>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonGroup>,
    )
    const [first, second, third] = Array.from(
      document.querySelectorAll<HTMLButtonElement>("button"),
    )

    expect(first.tabIndex).toBe(0)
    expect(second.tabIndex).toBe(-1)
    first.focus()

    fireEvent.keyDown(first, { key: "ArrowRight" })
    expect(document.activeElement).toBe(second)
    fireEvent.keyDown(second, { key: "End" })
    expect(document.activeElement).toBe(third)
    fireEvent.keyDown(third, { key: "ArrowRight" })
    expect(document.activeElement).toBe(first)
  })

  it("skips disabled items and leaves unrelated keys alone", () => {
    render(
      <ButtonGroup
        label="Actions"
        keyboard={{ orientation: "vertical", loop: false }}
      >
        <Button>First</Button>
        <Button disabled>Disabled</Button>
        <Button>Last</Button>
      </ButtonGroup>,
    )
    const [first, , last] = Array.from(
      document.querySelectorAll<HTMLButtonElement>("button"),
    )
    first.focus()

    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    })
    first.dispatchEvent(tabEvent)
    expect(tabEvent.defaultPrevented).toBe(false)

    fireEvent.keyDown(first, { key: "ArrowDown" })
    expect(document.activeElement).toBe(last)
    fireEvent.keyDown(last, { key: "ArrowDown" })
    expect(document.activeElement).toBe(last)
  })

  it("keeps all controls in the Tab order when keyboard navigation is not enabled", () => {
    render(
      <ButtonGroup label="Actions">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>,
    )
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("button"),
    )

    expect(buttons.map((button) => button.tabIndex)).toEqual([0, 0])
  })
})

describe("useHotkeys", () => {
  it("supports Ctrl and Meta modifier shortcuts", () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ "mod+k": handler }))

    fireEvent.keyDown(window, { key: "k", ctrlKey: true })
    expect(handler).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it("ignores editable fields by default", () => {
    const handler = vi.fn()
    render(
      <>
        <input aria-label="Search" />
        <div contentEditable aria-label="Editor" />
        <Hotkey handler={handler} />
      </>,
    )
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "/" })
    expect(handler).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByLabelText("Editor"), { key: "/" })
    expect(handler).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: "/" })
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

function Hotkey({ handler }: { handler: () => void }) {
  useHotkeys({ "/": handler })
  return null
}

import { useEffect, useRef } from "react"

export type HotkeyHandler = (event: KeyboardEvent) => void
export type HotkeyMap = Record<string, HotkeyHandler>

export interface UseHotkeysOptions {
  allowInInputs?: boolean
  preventDefault?: boolean
  target?: Window
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']",
    ),
  )
}

function matchesHotkey(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
  const key = parts.pop()
  if (!key || event.key.toLowerCase() !== key) return false

  const modifiers = new Set(parts)
  const expectsModifier = (name: string) =>
    modifiers.has(name) ||
    (name === "ctrl" && modifiers.has("control")) ||
    (name === "meta" && modifiers.has("cmd"))
  const expectsMod = modifiers.has("mod")
  const expectsCtrl = expectsModifier("ctrl") || (expectsMod && !event.metaKey)
  const expectsMeta = expectsModifier("meta") || (expectsMod && !event.ctrlKey)

  return (
    event.ctrlKey === expectsCtrl &&
    event.metaKey === expectsMeta &&
    event.altKey === modifiers.has("alt") &&
    event.shiftKey === modifiers.has("shift")
  )
}

export function useHotkeys(
  hotkeys: HotkeyMap,
  {
    allowInInputs = false,
    preventDefault = true,
    target,
  }: UseHotkeysOptions = {},
): void {
  const hotkeysRef = useRef(hotkeys)
  const optionsRef = useRef({ allowInInputs, preventDefault })
  hotkeysRef.current = hotkeys
  optionsRef.current = { allowInInputs, preventDefault }

  useEffect(() => {
    const eventTarget = target ?? window
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (!optionsRef.current.allowInInputs && isEditableTarget(event.target)) {
        return
      }

      const match = Object.entries(hotkeysRef.current).find(([shortcut]) =>
        matchesHotkey(event, shortcut),
      )
      if (!match) return

      if (optionsRef.current.preventDefault) event.preventDefault()
      match[1](event)
    }

    eventTarget.addEventListener("keydown", handleKeyDown)
    return () => eventTarget.removeEventListener("keydown", handleKeyDown)
  }, [target])
}

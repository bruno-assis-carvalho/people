import {
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react"
import { Button, Icon, Input, Select } from "../atoms"
import { ButtonGroupContext } from "../atoms/buttonGroupContext"
import styles from "./molecules.module.css"

export interface ButtonGroupKeyboardOptions {
  orientation?: "horizontal" | "vertical" | "both"
  loop?: boolean
  itemSelector?: string
}

const defaultKeyboardItemSelector =
  "button:not(:disabled), a[href], [role='option'], [role='menuitem'], [role='gridcell']"

function getKeyboardItems(
  root: HTMLDivElement,
  selector: string,
): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (item) => {
      if (
        item.hasAttribute("disabled") ||
        item.getAttribute("aria-disabled") === "true" ||
        item.closest("[hidden], [aria-hidden='true']")
      ) {
        return false
      }

      const style = window.getComputedStyle(item)
      return style.display !== "none" && style.visibility !== "hidden"
    },
  )
}

export function ButtonGroup({
  children,
  label,
  stackOnMobile = false,
  value,
  defaultValue = null,
  onValueChange,
  controls,
  toggleable = true,
  keyboard,
  className,
  onKeyDown,
  onFocusCapture,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "value" | "defaultValue"> & {
  label?: string
  stackOnMobile?: boolean
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  controls?: string
  toggleable?: boolean
  keyboard?: ButtonGroupKeyboardOptions
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  )
  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue
  const select = (nextValue: string) => {
    const selected =
      toggleable && selectedValue === nextValue ? null : nextValue
    if (!isControlled) setInternalValue(selected)
    onValueChange?.(selected)
  }

  const keyboardEnabled = keyboard !== undefined
  const orientation = keyboard?.orientation ?? "horizontal"
  const loop = keyboard?.loop ?? true
  const itemSelector = keyboard?.itemSelector ?? defaultKeyboardItemSelector
  const syncTabStops = (activeItem?: HTMLElement) => {
    const root = rootRef.current
    if (!root || !keyboardEnabled) return

    const items = getKeyboardItems(root, itemSelector)
    const current =
      (activeItem && items.includes(activeItem) ? activeItem : undefined) ??
      items.find((item) => item === document.activeElement) ??
      items[0]

    items.forEach((item) => {
      item.tabIndex = item === current ? 0 : -1
    })
  }

  useEffect(() => {
    if (keyboardEnabled) syncTabStops()
  }, [children, keyboardEnabled, itemSelector])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !keyboardEnabled) return

    const root = rootRef.current
    if (!root) return

    const items = getKeyboardItems(root, itemSelector)
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement,
    )
    if (currentIndex < 0 || items.length === 0) return

    const isRtl =
      root.dir === "rtl" || window.getComputedStyle(root).direction === "rtl"
    const forwardHorizontalKey = isRtl ? "ArrowLeft" : "ArrowRight"
    const backwardHorizontalKey = isRtl ? "ArrowRight" : "ArrowLeft"
    const isForward =
      (orientation !== "vertical" && event.key === forwardHorizontalKey) ||
      (orientation !== "horizontal" && event.key === "ArrowDown")
    const isBackward =
      (orientation !== "vertical" && event.key === backwardHorizontalKey) ||
      (orientation !== "horizontal" && event.key === "ArrowUp")

    let nextIndex: number | undefined
    if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = items.length - 1
    } else if (isForward) {
      nextIndex = currentIndex + 1
    } else if (isBackward) {
      nextIndex = currentIndex - 1
    }

    if (nextIndex === undefined) return
    event.preventDefault()

    if (loop) {
      nextIndex = (nextIndex + items.length) % items.length
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1))
    }

    const nextItem = items[nextIndex]
    syncTabStops(nextItem)
    nextItem.focus()
  }

  return (
    <ButtonGroupContext.Provider
      value={{
        value: selectedValue,
        controls,
        select,
      }}
    >
      <div
        {...props}
        className={`${styles.buttonGroup}${className ? ` ${className}` : ""}`}
        data-stack-mobile={stackOnMobile}
        role="group"
        aria-label={label}
        ref={rootRef}
        onKeyDown={handleKeyDown}
        onFocusCapture={(event) => {
          onFocusCapture?.(event)
          if (!event.defaultPrevented && keyboardEnabled) {
            const target = event.target
            if (target instanceof HTMLElement && target !== rootRef.current) {
              syncTabStops(target)
            }
          }
        }}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  )
}

export function Field({
  label,
  name,
  value,
  type = "text",
  required,
  placeholder,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  name: string
  value: string
  type?: string
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
  step?: number
  onChange: ChangeEventHandler<HTMLInputElement>
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <Input
        id={name}
        name={name}
        value={value}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  )
}

export function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string
  name: string
  value: string
  options: string[]
  onChange: ChangeEventHandler<HTMLSelectElement>
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <Select id={name} name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </Select>
    </div>
  )
}

export function SearchField({
  value,
  label,
  placeholder,
  onChange,
}: {
  value: string
  label: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.search}>
      <Input
        aria-label={label}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export function DataItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className={styles.dataItem}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export function Feedback({
  children,
  success = false,
  role = "status",
}: {
  children: ReactNode
  success?: boolean
  role?: "status" | "note"
}) {
  return (
    <div
      className={styles.feedback}
      data-state={success ? "success" : "neutral"}
      role={role}
      aria-live={role === "status" ? "polite" : undefined}
    >
      {children}
    </div>
  )
}

export function Breadcrumb({ label }: { label: string }) {
  return (
    <div className={styles.breadcrumb}>
      <img src="/assets/38a49.svg" alt="" />
      <span>{label}</span>
    </div>
  )
}

export function FileUpload({
  label,
  helper,
  previewUrl,
  accept = "image/*",
  onFileSelect,
  onClear,
}: {
  label: string
  helper: string
  previewUrl?: string
  accept?: string
  onFileSelect: (file?: File) => void
  onClear: () => void
}) {
  const [isDragging, setDragging] = useState(false)

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    onFileSelect(event.dataTransfer.files?.[0])
  }

  return (
    <div
      className={styles.upload}
      data-state={previewUrl ? "selected" : "empty"}
    >
      <label
        className={styles.dropzone}
        data-dragging={isDragging}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          className={styles.fileInput}
          type="file"
          accept={accept}
          onChange={(event) => onFileSelect(event.target.files?.[0])}
        />
        {previewUrl ? (
          <img className={styles.uploadPreview} src={previewUrl} alt="" />
        ) : (
          <span className={styles.uploadIcon}>
            <Icon src="/assets/fd90f.svg" size="medium" />
          </span>
        )}
        <span className={styles.uploadCopy}>
          <strong>{previewUrl ? "Imagem selecionada" : label}</strong>
          <small>
            {previewUrl ? "Clique ou arraste para substituir" : helper}
          </small>
        </span>
      </label>
      {previewUrl && (
        <Button variant="secondary" onClick={onClear}>
          Remover imagem
        </Button>
      )}
    </div>
  )
}

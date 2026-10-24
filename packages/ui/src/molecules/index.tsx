import {
  useState,
  type ChangeEventHandler,
  type DragEvent,
  type ReactNode,
} from "react"
import { Button, Icon, Input, Select } from "../atoms"
import styles from "./molecules.module.css"

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

export interface SkinConfig {
  background: string
  surface: string
  text: string
  action: string
  accent: string
  depth: number
  radius: number
  backgroundImage: string
}

export const defaultSkinConfig: SkinConfig = {
  background: "#f4f4f4",
  surface: "#ffffff",
  text: "#181818",
  action: "#2c2c2c",
  accent: "#636363",
  depth: 8,
  radius: 12,
  backgroundImage: "",
}

export type SkinPresetId = "default" | "newmorphism" | "liquid-glass" | "neon-glass" | "neon"
export type SkinId = SkinPresetId | "custom"

const skinPresets: Readonly<Record<SkinPresetId, Readonly<SkinConfig>>> = {
  default: defaultSkinConfig,
  newmorphism: {
    background: "#e6e9ef",
    surface: "#e6e9ef",
    text: "#2f3540",
    action: "#e6e9ef",
    accent: "#596374",
    depth: 18,
    radius: 20,
    backgroundImage: "",
  },
  "liquid-glass": {
    background: "#edf2f8",
    surface: "#ffffff",
    text: "#172033",
    action: "#d7e9ff",
    accent: "#536d98",
    depth: 16,
    radius: 24,
    backgroundImage: "",
  },
  "neon-glass": {
    background: "#070b14",
    surface: "#0e1b2d",
    text: "#eafdff",
    action: "#0d4857",
    accent: "#ff35d2",
    depth: 20,
    radius: 22,
    backgroundImage: "",
  },
  neon: {
    background: "#05070d",
    surface: "#0d1320",
    text: "#eaffff",
    action: "#00e4ff",
    accent: "#ff28c8",
    depth: 16,
    radius: 10,
    backgroundImage: "",
  },
}

export const skinPresetOptions: ReadonlyArray<{
  id: SkinPresetId
  label: string
}> = [
  { id: "default", label: "Padrão" },
  { id: "newmorphism", label: "Newmorphism" },
  { id: "liquid-glass", label: "Liquid Glass" },
  { id: "neon-glass", label: "Neon Glass" },
  { id: "neon", label: "Neon" },
]

export function isSkinPresetId(value: string): value is SkinPresetId {
  return Object.prototype.hasOwnProperty.call(skinPresets, value)
}

export function isSkinId(value: string): value is SkinId {
  return value === "custom" || isSkinPresetId(value)
}

export function createSkinConfigFromPreset(id: SkinPresetId): SkinConfig {
  return { ...skinPresets[id] }
}

function relativeLuminance(color: string) {
  const channels = [1, 3, 5].map((index) => {
    const channel = Number.parseInt(color.slice(index, index + 2), 16) / 255
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrastRatio(first: string, second: string) {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  )
  return (luminances[0] + 0.05) / (luminances[1] + 0.05)
}

function mixColors(foreground: string, background: string, weight: number) {
  const channels = [1, 3, 5].map((index) => {
    const front = Number.parseInt(foreground.slice(index, index + 2), 16)
    const back = Number.parseInt(background.slice(index, index + 2), 16)
    return Math.round(front * weight + back * (1 - weight))
      .toString(16)
      .padStart(2, "0")
  })
  return `#${channels.join("")}`
}

function getMutedColor(text: string, surface: string) {
  for (let weight = 0.68; weight <= 1; weight += 0.02) {
    const muted = mixColors(text, surface, Math.min(weight, 1))
    if (contrastRatio(muted, surface) >= 4.5) return muted
  }
  return text
}

function getOnActionColor(action: string) {
  const luminance = relativeLuminance(action)
  const whiteContrast = 1.05 / (luminance + 0.05)
  const blackContrast = (luminance + 0.05) / 0.05
  return whiteContrast >= blackContrast ? "#ffffff" : "#000000"
}

export function getSkinContrastWarnings(config: SkinConfig) {
  const warnings: string[] = []
  if (contrastRatio(config.text, config.background) < 4.5) {
    warnings.push("O contraste do texto com o fundo está abaixo de 4,5:1.")
  }
  if (contrastRatio(config.text, config.surface) < 4.5) {
    warnings.push("O contraste do texto com a superfície está abaixo de 4,5:1.")
  }
  return warnings
}

const STORAGE_KEY = "nexus-custom-skin"
const STYLE_ID = "nexus-custom-skin-tokens"

function isSkinConfig(value: unknown): value is SkinConfig {
  if (typeof value !== "object" || value === null) return false
  const config = value as Record<string, unknown>
  const isColor = (color: unknown) =>
    typeof color === "string" && /^#[\da-f]{6}$/i.test(color)
  return (
    isColor(config.background) &&
    isColor(config.surface) &&
    isColor(config.text) &&
    isColor(config.action) &&
    isColor(config.accent) &&
    typeof config.depth === "number" &&
    Number.isFinite(config.depth) &&
    config.depth >= 0 &&
    config.depth <= 32 &&
    typeof config.radius === "number" &&
    Number.isFinite(config.radius) &&
    config.radius >= 0 &&
    config.radius <= 32 &&
    typeof config.backgroundImage === "string" &&
    config.backgroundImage.length <= 2_100_000 &&
    (config.backgroundImage === "" ||
      /^data:image\/[\da-z.+-]+;base64,[a-z\d+/=]+$/i.test(
        config.backgroundImage,
      ))
  )
}

export function readSkinConfig(
  onWarning?: (message: string) => void,
): SkinConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultSkinConfig
    const parsed: unknown = JSON.parse(stored)
    if (isSkinConfig(parsed)) return parsed
    onWarning?.(
      "A configuração salva está inválida. Os valores padrão foram carregados.",
    )
  } catch {
    onWarning?.("Não foi possível ler a configuração salva neste navegador.")
  }
  return defaultSkinConfig
}

function createTokenRule(config: SkinConfig) {
  const depth = Math.max(0, config.depth)
  const radius = Math.max(0, config.radius) / 16
  const shadow =
    depth === 0 ? "none" : `0 ${depth / 16}rem ${depth / 8}rem rgb(0 0 0 / 18%)`
  const surface = config.backgroundImage
    ? `${config.surface}d9`
    : config.surface
  const layer = config.backgroundImage ? `${config.surface}b8` : config.surface
  const content = config.backgroundImage
    ? `${config.surface}8c`
    : config.background
  const background = config.backgroundImage
    ? `linear-gradient(${config.background}cc, ${config.background}cc), url(${JSON.stringify(config.backgroundImage)}) center / cover fixed`
    : config.background

  return `:root[data-skin="custom"] {
    --ds-color-background: ${background};
    --ds-color-surface: ${surface};
    --ds-color-surface-raised: ${surface};
    --ds-color-surface-hover: color-mix(in srgb, ${surface} 88%, ${config.accent});
    --ds-color-surface-selected: color-mix(in srgb, ${surface} 76%, ${config.accent});
    --ds-color-placeholder: color-mix(in srgb, ${surface} 65%, ${config.text});
    --ds-color-text: ${config.text};
    --ds-color-text-muted: ${getMutedColor(config.text, config.surface)};
    --ds-color-border: color-mix(in srgb, ${config.accent} 35%, transparent);
    --ds-color-border-strong: ${config.accent};
    --ds-color-sidebar: ${layer};
    --ds-color-header: ${layer};
    --ds-color-content: ${content};
    --ds-color-action: ${config.action};
    --ds-color-action-hover: color-mix(in srgb, ${config.action} 82%, ${surface});
    --ds-color-on-action: ${getOnActionColor(config.action)};
    --ds-color-focus: ${config.accent};
    --ds-radius-md: ${radius * 0.7}rem;
    --ds-radius-lg: ${radius}rem;
    --ds-shadow-sm: ${shadow};
    --ds-shadow-lg: ${shadow};
    --ds-shadow-control: ${shadow};
    --ds-shadow-surface: ${shadow};
  }`
}

export function applySkinConfig(config: SkinConfig, persist = true) {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement("style")
    style.id = STYLE_ID
    document.head.append(style)
  }
  style.textContent = createTokenRule(config)
  document.documentElement.dataset.skin = "custom"
  let persisted = true
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      localStorage.setItem("nexus-skin", "custom")
      delete document.documentElement.dataset.skinWarning
    } catch {
      persisted = false
      document.documentElement.dataset.skinWarning =
        "A skin foi aplicada nesta sessão, mas não foi salva neste navegador."
    }
  }
  window.dispatchEvent(
    new CustomEvent("nexus-skin-change", { detail: "custom" }),
  )
  return persisted
}

export function applyStoredCustomSkin() {
  let warning: string | undefined
  const config = readSkinConfig((message) => {
    warning = message
  })
  document.documentElement.dataset.skinWarning = warning ?? ""
  applySkinConfig(config, false)
}

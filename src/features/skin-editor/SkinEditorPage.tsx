import { useEffect, useState } from "react"
import {
  Button,
  ButtonGroup,
  ContentSection,
  DataItem,
  DetailList,
  Feedback,
  Field,
  FileUpload,
  Input,
  ResponsiveGrid,
  Select,
  SidePanel,
  SplitLayout,
  Status,
} from "@ui"
import {
  applySkinConfig,
  createSkinConfigFromPreset,
  defaultSkinConfig,
  getSkinContrastWarnings,
  isSkinPresetId,
  readSkinConfig,
  skinPresetOptions,
  type SkinConfig,
} from "@/app/customSkin"

export default function SkinEditorPage() {
  const [message, setMessage] = useState("")
  const [values, setValues] = useState<SkinConfig>(() =>
    readSkinConfig(setMessage),
  )
  const contrastWarnings = getSkinContrastWarnings(values)

  useEffect(() => {
    applySkinConfig(values, false)
  }, [values])

  const update = (field: keyof SkinConfig, value: string | number) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const selectBackground = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/") || file.size > 1_500_000) {
      setMessage("Use uma imagem de até 1,5 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setMessage("Não foi possível carregar a imagem.")
        return
      }
      update("backgroundImage", reader.result)
      setMessage("Imagem pronta para ser aplicada.")
    }
    reader.onerror = () => setMessage("Não foi possível carregar a imagem.")
    reader.readAsDataURL(file)
  }

  return (
    <SplitLayout
      aside={
        <SidePanel label="Pré-visualização da skin">
          <ContentSection
            title="Catálogo de componentes"
            description="Pré-visualização ao vivo"
          >
            <Status state="active">Ativo</Status>
            <Feedback success role="note">
              Os componentes abaixo usam os tokens que você está editando.
            </Feedback>
          </ContentSection>
          <ContentSection title="Botões">
            <ButtonGroup>
              <Button>Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="danger">Perigo</Button>
            </ButtonGroup>
          </ContentSection>
          <ContentSection title="Campos">
            <Input
              aria-label="Campo de demonstração"
              placeholder="Digite um valor"
            />
            <Select aria-label="Seleção de demonstração" defaultValue="Ativo">
              <option>Ativo</option>
              <option>Inativo</option>
            </Select>
          </ContentSection>
          <DetailList>
            <DataItem label="Tipografia">
              Texto e hierarquia da interface
            </DataItem>
            <DataItem label="Status">
              <Status state="active">Ativo</Status>
            </DataItem>
          </DetailList>
        </SidePanel>
      }
    >
      <ContentSection
        title="Partir de uma skin existente"
        description="Copie os tokens para a Personalizada sem alterar a skin original."
      >
        <ResponsiveGrid>
          {skinPresetOptions.map((preset) => (
            <Button
              key={preset.id}
              variant="secondary"
              onClick={() => {
                if (!isSkinPresetId(preset.id)) {
                  setMessage("O preset selecionado não é válido.")
                  return
                }
                setValues(createSkinConfigFromPreset(preset.id))
                setMessage("Preset copiado para a skin personalizada.")
              }}
            >
              {preset.label}
            </Button>
          ))}
        </ResponsiveGrid>
        <Feedback role="note">
          As skins originais são protegidas. Toda alteração será aplicada
          somente à skin Personalizada.
        </Feedback>
      </ContentSection>
      <ContentSection
        title="Cores"
        description="Defina os principais tokens visuais da aplicação."
      >
        <ResponsiveGrid>
          {([
            ["background", "Fundo"],
            ["surface", "Superfície"],
            ["text", "Texto"],
            ["action", "Ação"],
            ["accent", "Destaque"],
          ] as const).map(([field, label]) => (
            <Field
              key={field}
              label={label}
              name={field}
              type="color"
              value={values[field]}
              onChange={(event) => update(field, event.target.value)}
            />
          ))}
        </ResponsiveGrid>
      </ContentSection>
      <ContentSection
        title="Forma e profundidade"
        description="Ajuste elevação e arredondamento dos componentes."
      >
        <ResponsiveGrid>
          <Field
            label={`Profundidade: ${values.depth}`}
            name="depth"
            type="range"
            min={0}
            max={32}
            value={String(values.depth)}
            onChange={(event) => update("depth", Number(event.target.value))}
          />
          <Field
            label={`Arredondamento: ${values.radius}`}
            name="radius"
            type="range"
            min={0}
            max={32}
            value={String(values.radius)}
            onChange={(event) => update("radius", Number(event.target.value))}
          />
        </ResponsiveGrid>
      </ContentSection>
      <ContentSection
        title="Imagem de fundo"
        description="Opcional. Use uma imagem de até 1,5 MB."
      >
        <FileUpload
          label="Selecionar imagem"
          helper="Clique para procurar ou arraste uma imagem para esta área."
          previewUrl={values.backgroundImage}
          onFileSelect={selectBackground}
          onClear={() => update("backgroundImage", "")}
        />
      </ContentSection>
      {contrastWarnings.map((warning) => (
        <Feedback key={warning} role="note">
          {warning}
        </Feedback>
      ))}
      {message && <Feedback>{message}</Feedback>}
      <ButtonGroup>
        <Button
          variant="secondary"
          onClick={() => {
            setValues(defaultSkinConfig)
            const persisted = applySkinConfig(defaultSkinConfig)
            setMessage(
              persisted
                ? "Valores padrão restaurados."
                : "Valores padrão restaurados nesta sessão, mas não foram salvos neste navegador.",
            )
          }}
        >
          Restaurar
        </Button>
        <Button
          onClick={() => {
            const persisted = applySkinConfig(values)
            setMessage(
              persisted
                ? "Skin personalizada aplicada e salva."
                : "Skin aplicada nesta sessão, mas não foi salva neste navegador.",
            )
          }}
        >
          Aplicar e salvar skin
        </Button>
      </ButtonGroup>
    </SplitLayout>
  )
}

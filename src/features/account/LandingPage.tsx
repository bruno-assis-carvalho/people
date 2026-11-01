import { useNavigate } from "react-router"
import { ContentCard, LandingPageLayout } from "@ui"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <LandingPageLayout
      brand="Nexus XP / APIS"
      eyebrow="Gestão simples, relações mais fortes"
      title="Pessoas no centro de tudo."
      description="Um espaço claro e organizado para manter as informações da sua equipe sempre por perto."
      actionLabel="Entrar"
      onAction={() => navigate("/in")}
    >
      <ContentCard title="Tudo em um só lugar">
        Encontre rapidamente os dados importantes da sua equipe.
      </ContentCard>
      <ContentCard title="Organização sem esforço">
        Mantenha cada perfil atualizado com uma experiência simples.
      </ContentCard>
      <ContentCard title="Feito para sua equipe">
        Uma visão prática para cuidar melhor das relações de trabalho.
      </ContentCard>
    </LandingPageLayout>
  )
}

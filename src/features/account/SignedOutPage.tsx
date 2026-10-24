import { useNavigate } from "react-router"
import { SignedOutTemplate } from "@ui"

export default function SignedOutPage() {
  const navigate = useNavigate()
  return (
    <SignedOutTemplate
      title="Sessão encerrada"
      description="Você saiu da sua conta com segurança."
      actionLabel="Entrar novamente"
      onAction={() => navigate("/in/people")}
    />
  )
}

import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Button,
  ConfirmModal,
  DataItem,
  DetailList,
  DetailTemplate,
  EmptyState,
  Status,
} from "@ui"
import { usePeople } from "./PeopleProvider"

export default function PersonDetailPage() {
  const { id = "" } = useParams()
  const { getPerson, deletePerson } = usePeople()
  const navigate = useNavigate()
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const person = getPerson(id)

  const onBack = () => navigate("/in/people")
  const onDeleteConfirm = () => {
    deletePerson(id)
    navigate("/in/people", {
      state: { feedback: "Pessoa excluída com sucesso." },
    })
  }

  if (!person) {
    return (
      <EmptyState
        title="Registro não encontrado"
        description="O registro solicitado não está disponível."
        actionLabel="Voltar para consulta"
        onAction={onBack}
      />
    )
  }

  return (
    <>
      <DetailTemplate
        actions={
          <>
            <Button variant="secondary" onClick={onBack}>
              Voltar para consulta
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Excluir registro
            </Button>
          </>
        }
      >
        <DetailList>
          <DataItem label="Nome completo">{person.name}</DataItem>
          <DataItem label="Situação">
            <Status state={person.status === "Ativo" ? "active" : "inactive"}>
              {person.status}
            </Status>
          </DataItem>
          <DataItem label="E-mail">{person.email}</DataItem>
          <DataItem label="Telefone">{person.phone}</DataItem>
          <DataItem label="CPF">{person.document}</DataItem>
          <DataItem label="Data de nascimento">
            {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
              new Date(`${person.birthDate}T00:00:00Z`),
            )}
          </DataItem>
          <DataItem label="Cidade">{person.city}</DataItem>
        </DetailList>
      </DetailTemplate>
      <ConfirmModal
        open={isDeleteOpen}
        recordName={person.name}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={onDeleteConfirm}
      />
    </>
  )
}

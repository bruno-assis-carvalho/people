import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router"
import { EmptyState, Field, Form, FormTemplate, SelectField } from "@ui"
import { usePeople } from "./PeopleProvider"
import type { PersonInput } from "./types"

const emptyPerson: PersonInput = {
  name: "",
  email: "",
  phone: "",
  document: "",
  birthDate: "",
  city: "",
  status: "Ativo",
}

export default function PersonFormPage() {
  const { id } = useParams()
  const { getPerson, createPerson, updatePerson } = usePeople()
  const navigate = useNavigate()
  const existingPerson = id ? getPerson(id) : undefined
  const [values, setValues] = useState<PersonInput>(
    existingPerson ?? emptyPerson,
  )

  useEffect(() => {
    setValues(existingPerson ?? emptyPerson)
  }, [id, existingPerson])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (id && existingPerson) {
      updatePerson(id, values)
      navigate(`/in/people/${id}`, {
        state: { feedback: "Dados atualizados com sucesso." },
      })
      return
    }
    const person = createPerson(values)
    navigate(`/in/people/${person.id}`, {
      state: { feedback: "Pessoa adicionada com sucesso." },
    })
  }

  const onCancel = () =>
    navigate(id && existingPerson ? `/in/people/${id}` : "/in/people")

  if (id && !existingPerson) {
    return (
      <EmptyState
        title="Registro não encontrado"
        description="O registro solicitado não está disponível."
        actionLabel="Voltar para consulta"
        onAction={onCancel}
      />
    )
  }

  return (
    <FormTemplate>
      <Form
        onSubmit={handleSubmit}
        onCancel={onCancel}
        cancelLabel="Cancelar"
        submitLabel="Salvar pessoa"
      >
        <Field
          label="Nome completo"
          name="name"
          value={values.name}
          required
          placeholder="Digite o nome completo"
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
        <Field
          label="E-mail"
          name="email"
          value={values.email}
          type="email"
          required
          placeholder="nome@email.com"
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
        />
        <Field
          label="Telefone"
          name="phone"
          value={values.phone}
          required
          placeholder="(00) 00000-0000"
          onChange={(event) =>
            setValues((current) => ({ ...current, phone: event.target.value }))
          }
        />
        <Field
          label="CPF"
          name="document"
          value={values.document}
          required
          placeholder="000.000.000-00"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              document: event.target.value,
            }))
          }
        />
        <Field
          label="Data de nascimento"
          name="birthDate"
          value={values.birthDate}
          type="date"
          required
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              birthDate: event.target.value,
            }))
          }
        />
        <Field
          label="Cidade"
          name="city"
          value={values.city}
          required
          placeholder="Cidade, UF"
          onChange={(event) =>
            setValues((current) => ({ ...current, city: event.target.value }))
          }
        />
        <SelectField
          label="Situação"
          name="status"
          value={values.status}
          options={["Ativo", "Inativo"]}
          onChange={(event) => {
            const status = event.target.value
            if (status === "Ativo" || status === "Inativo") {
              setValues((current) => ({ ...current, status }))
            }
          }}
        />
      </Form>
    </FormTemplate>
  )
}

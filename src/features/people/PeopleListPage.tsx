import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  CardGrid,
  ContentCard,
  EmptyState,
  ListTemplate,
  SearchField,
  Status,
} from "@ui"
import { usePeople } from "./PeopleProvider"

export default function PeopleListPage() {
  const { people } = usePeople()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const filteredPeople = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR")
    if (!normalized) return people
    return people.filter((person) =>
      [person.name, person.email, person.document, person.city].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalized),
      ),
    )
  }, [people, query])

  return (
    <ListTemplate
      toolbar={
        <SearchField
          label="Consultar pessoas"
          placeholder="Buscar por nome, e-mail, CPF ou cidade"
          value={query}
          onChange={setQuery}
        />
      }
      isEmpty={filteredPeople.length === 0}
      emptyState={
        <EmptyState
          title={
            query ? "Nenhuma pessoa encontrada" : "Nenhuma pessoa cadastrada"
          }
          description={
            query
              ? "Tente consultar por outro termo ou adicione um novo registro."
              : "Comece adicionando o primeiro registro de pessoa."
          }
          actionLabel="＋ Adicionar pessoa"
          onAction={() => navigate("/in/people/create")}
        />
      }
    >
      <CardGrid label="Pessoas cadastradas">
        {filteredPeople.map((person) => (
          <ContentCard
            key={person.id}
            label={`Ver dados de ${person.name}`}
            onClick={() => navigate(`/in/people/${person.id}`)}
            title={person.name}
          >
            <span>{person.email}</span>
            <span>{person.phone}</span>
            <Status state={person.status === "Ativo" ? "active" : "inactive"}>
              {person.status}
            </Status>
          </ContentCard>
        ))}
      </CardGrid>
    </ListTemplate>
  )
}

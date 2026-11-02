import { useCallback, useMemo, useState } from "react"
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

const PAGE_SIZE = 20

export default function PeopleListPage() {
  const { people } = usePeople()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const filteredPeople = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR")
    if (!normalized) return people
    return people.filter((person) =>
      [person.name, person.email, person.document, person.city].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalized),
      ),
    )
  }, [people, query])
  const visiblePeople = filteredPeople.slice(0, visibleCount)
  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE)
  }, [])
  const handleQueryChange = (nextQuery: string) => {
    setVisibleCount(PAGE_SIZE)
    setQuery(nextQuery)
  }

  return (
    <ListTemplate
      toolbar={
        <SearchField
          label="Consultar pessoas"
          placeholder="Buscar por nome, e-mail, CPF ou cidade"
          value={query}
          onChange={handleQueryChange}
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
      <CardGrid
        label="Pessoas cadastradas"
        hasMore={visiblePeople.length < filteredPeople.length}
        onLoadMore={loadMore}
        loadMoreLabel="Carregar mais"
      >
        {visiblePeople.map((person) => (
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

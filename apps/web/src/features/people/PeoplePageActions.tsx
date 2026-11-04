import { useNavigate, useParams } from "react-router"
import { Button } from "@ui"
import { usePeople } from "./PeopleProvider"

export function PeopleListHeaderAction() {
  const navigate = useNavigate()

  return (
    <Button onClick={() => navigate("/in/people/create")}>
      ＋ Adicionar pessoa
    </Button>
  )
}

export function PersonDetailHeaderAction() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { getPerson } = usePeople()

  if (!getPerson(id)) return null

  return (
    <Button onClick={() => navigate(`/in/people/${id}/edit`)}>
      Editar pessoa
    </Button>
  )
}

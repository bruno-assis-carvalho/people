import { DataItem, DetailList, Status } from "@ui"
import { useAuth0 } from "@auth0/auth0-react"

export default function ProfilePage() {
  const { user } = useAuth0()

  return (
    <DetailList>
      <DataItem label="Nome">{user?.name ?? user?.nickname ?? "—"}</DataItem>
      <DataItem label="E-mail">{user?.email ?? "—"}</DataItem>
      <DataItem label="Identificador">{user?.sub ?? "—"}</DataItem>
      <DataItem label="Status">
        <Status state="active">Autenticado</Status>
      </DataItem>
    </DetailList>
  )
}

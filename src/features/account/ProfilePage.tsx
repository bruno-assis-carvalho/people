import { DataItem, DetailList, Status } from "@ui"

export default function ProfilePage() {
  return (
    <DetailList>
      <DataItem label="Nome">Usuário Nexus</DataItem>
      <DataItem label="E-mail">usuario@nexus.local</DataItem>
      <DataItem label="Função">Administrador</DataItem>
      <DataItem label="Status">
        <Status state="active">Ativo</Status>
      </DataItem>
    </DetailList>
  )
}

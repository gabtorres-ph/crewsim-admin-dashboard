import { listCrew } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/crew/components/columns"

function loadCrew() {
  return listCrew({ offset: 0, limit: 100 })
}

export function CrewPage() {
  return (
    <ResourceTablePage
      title="Crew"
      description="View crew identity records from the backend contract."
      columns={columns}
      load={loadCrew}
    />
  )
}

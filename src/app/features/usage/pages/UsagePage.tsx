import { listUsage } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/usage/components/columns"

function loadUsage() {
  return listUsage({ offset: 0, limit: 100 })
}

export function UsagePage() {
  return (
    <ResourceTablePage
      title="Usage"
      description="View usage records from the backend contract."
      columns={columns}
      load={loadUsage}
    />
  )
}

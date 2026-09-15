import { listPackages } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/packages/components/columns"

function loadPackages() {
  return listPackages({ offset: 0, limit: 100 })
}

export function PackagesPage() {
  return (
    <ResourceTablePage
      title="Packages"
      description="View package records from the backend contract."
      columns={columns}
      load={loadPackages}
    />
  )
}

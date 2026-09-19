import { listEmailWhitelist } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/whitelist/components/columns"

function loadEmailWhitelist() {
  return listEmailWhitelist({ offset: 0, limit: 100 })
}

export function EmailWhitelistPage() {
  return (
    <ResourceTablePage
      title="Email Whitelist"
      description="View email whitelist records from the backend contract."
      columns={columns}
      load={loadEmailWhitelist}
    />
  )
}

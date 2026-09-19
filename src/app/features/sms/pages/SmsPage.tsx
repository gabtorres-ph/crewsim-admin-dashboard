import { listSms } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/sms/components/columns"

function loadSms() {
  return listSms({ offset: 0, limit: 100 })
}

export function SmsPage() {
  return (
    <ResourceTablePage
      title="SMS"
      description="View stored SMS records from the backend contract."
      columns={columns}
      load={loadSms}
    />
  )
}

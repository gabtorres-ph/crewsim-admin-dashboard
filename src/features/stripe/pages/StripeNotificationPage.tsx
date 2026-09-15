import { listStripeNotifications } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/stripe/components/columns"

function loadStripeNotifications() {
  return listStripeNotifications({ offset: 0, limit: 100 })
}

export function StripeNotificationPage() {
  return (
    <ResourceTablePage
      title="Stripe Notifications"
      description="View stored Stripe notification records from the backend contract."
      columns={columns}
      load={loadStripeNotifications}
    />
  )
}

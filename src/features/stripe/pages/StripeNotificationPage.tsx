import { DataTable } from "@/shared/ui/data-table/DataTable"
import {
  columns,
  type StripeNotificationTableRow,
} from "@/features/stripe/components/columns"

const stripeNotifications: StripeNotificationTableRow[] = []

export function StripeNotificationPage() {
    return (
        <section className="mx-auto max-w-7xl">
            <header>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        StripeNotification
                    </h1>
                </div>
            </header>
            <div className="mt-6">
                <DataTable data={stripeNotifications} columns={columns} />
            </div>
        </section>
    )
}

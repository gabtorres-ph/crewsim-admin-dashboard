import { DataTable } from "@/shared/ui/data-table/DataTable"
import {
  columns,
  type SmsTableRow,
} from "@/features/sms/components/columns"

const sms: SmsTableRow[] = []

export function SmsPage() {
    return (
        <section className="mx-auto max-w-7xl">
            <header>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        SMS
                    </h1>
                </div>
            </header>
            <div className="mt-6">
                <DataTable data={sms} columns={columns} />
            </div>
        </section>
    )
}

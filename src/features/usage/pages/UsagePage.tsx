
import { DataTable } from "@/shared/ui/data-table/DataTable"
import {
  columns,
  type UsageTableRow,
} from "@/features/usage/components/columns"

const usage: UsageTableRow[] = []

export function UsagePage() {
    return (
        <section className="mx-auto max-w-7xl">
            <header>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        Usage
                    </h1>
                </div>
            </header>
            <div className="mt-6">
                <DataTable data={usage} columns={columns} />
            </div>
        </section>
    )
}

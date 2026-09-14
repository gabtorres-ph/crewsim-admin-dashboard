import { DataTable } from "@/shared/ui/data-table/DataTable"
import {
  columns,
  type EmailWhitelistTableRow,
} from "@/features/whitelist/components/columns"

const emailWhitelist: EmailWhitelistTableRow[] = []

export function EmailWhitelistPage() {
    return (
        <section className="mx-auto max-w-7xl">
            <header>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        Email Whitelist
                    </h1>
                </div>
            </header>
            <div className="mt-6">
                <DataTable data={emailWhitelist} columns={columns} />
            </div>
        </section>
    )
}

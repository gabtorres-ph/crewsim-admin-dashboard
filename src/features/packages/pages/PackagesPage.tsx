
import { DataTable } from "@/shared/ui/data-table/DataTable"
import {
  columns,
  type PackageTableRow,
} from "@/features/packages/components/columns"

const packages: PackageTableRow[] = []

export function PackagesPage() {
    return (
        <section className="mx-auto max-w-7xl">
            <header>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        Package
                    </h1>
                </div>
            </header>
            <div className="mt-6">
                <DataTable data={packages} columns={columns} />
            </div>
        </section>
    )
}

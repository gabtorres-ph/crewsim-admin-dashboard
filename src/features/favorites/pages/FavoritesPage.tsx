
import { DataTable } from "@/shared/ui/data-table/DataTable"
import {
  columns,
  type FavoriteTableRow,
} from "@/features/favorites/components/columns"

const favorites: FavoriteTableRow[] = []

export function FavoritesPage() {
    return (
        <section className="mx-auto max-w-7xl">
            <header>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        Favorites
                    </h1>
                </div>
            </header>
            <div className="mt-6">
                <DataTable data={favorites} columns={columns} />
            </div>
        </section>
    )
}

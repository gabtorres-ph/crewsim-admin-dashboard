import { listFavorites } from "../api"
import { ResourceTablePage } from "@/shared/ui"
import { columns } from "@/features/favorites/components/columns"

function loadFavorites() {
  return listFavorites({ offset: 0, limit: 100 })
}

export function FavoritesPage() {
  return (
    <ResourceTablePage
      title="Favorites"
      description="View favorite country records from the backend contract."
      columns={columns}
      load={loadFavorites}
    />
  )
}

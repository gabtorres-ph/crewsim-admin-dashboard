import { fetchAllOffsetPages } from "@/lib/fetchAllPages"
import { FavoritesTable } from "./FavoritesTable"
import { fetchFavorites } from "./api"

export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  const favorites = await fetchAllOffsetPages(fetchFavorites)

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Favorites
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <FavoritesTable favorites={favorites} />
      </div>
    </>
  )
}

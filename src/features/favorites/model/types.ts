
export type Favorites = {
    id: number
    userId: number
    country: string
}

export type FavoritesCreateInput = {
    userId: number
    country: string
}
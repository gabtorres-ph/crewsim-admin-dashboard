export type FavoriteCreate = {
  user_id: number
  country: string
}

export type FavoriteRead = FavoriteCreate & {
  id: number
}

export type Favorite = FavoriteRead

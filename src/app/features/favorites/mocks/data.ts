import type { FavoriteRead } from '../model'

export const mockFavorites = [
  { id: 4001, user_id: 1001, country: 'Philippines' },
  { id: 4002, user_id: 1002, country: 'Singapore' },
  { id: 4003, user_id: 1003, country: 'Japan' },
  { id: 4004, user_id: 1007, country: 'United States' },
] satisfies readonly FavoriteRead[]

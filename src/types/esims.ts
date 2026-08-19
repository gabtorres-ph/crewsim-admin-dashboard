
export type Esim = {
  id: number
  userId: number
  imsi: string
}

export type EsimInput = {
  userId: number
  imsi: string
}

export type EsimSortKey = 'id' | 'user' | 'imsi'

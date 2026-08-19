
export type Esim = {
  id: number
  user: string
  imsi: string
}

export type EsimInput = {
  user: string
  imsi: string
}

export type EsimSortKey = 'id' | 'user' | 'imsi'

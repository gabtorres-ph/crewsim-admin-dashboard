export type CrewCreate = {
  unique_id: string
  iscrewid: boolean
  createdate: string
  file1?: string | null
  file2?: string | null
  firstname?: string | null
  lastname?: string | null
  airline?: string | null
  user_id?: number | null
  file1_hash?: string | null
  file2_hash?: string | null
  reason?: string | null
  confidence?: string | null
  type?: string | null
  dhash?: string | null
  phash?: string | null
  dhash_distance?: number | null
  phash_distance?: number | null
}

export type CrewUpdate = Partial<CrewCreate>

export type CrewRead = {
  id: number
  unique_id: string
  iscrewid: boolean
  createdate: string
  file1: string | null
  file2: string | null
  firstname: string | null
  lastname: string | null
  airline: string | null
  user_id: number | null
  file1_hash: string | null
  file2_hash: string | null
  reason: string | null
  confidence: string | null
  type: string | null
  dhash: string | null
  phash: string | null
  dhash_distance: number | null
  phash_distance: number | null
}

export type Crew = CrewRead

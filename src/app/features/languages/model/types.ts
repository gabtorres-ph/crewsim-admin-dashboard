export type LanguageCreate = {
  iso1?: string | null
  iso2b?: string | null
  iso2t?: string | null
  iso3: string
  name: string
}

export type LanguageUpdate = {
  iso1?: string | null
  iso2b?: string | null
  iso2t?: string | null
  iso3?: string
  name?: string
}

export type LanguageRead = {
  id: number
  iso1: string | null
  iso2b: string | null
  iso2t: string | null
  iso3: string
  name: string
}

export type Language = LanguageRead

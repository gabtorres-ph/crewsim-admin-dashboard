export type PackageCreate = {
  sku: string
  name?: string | null
  price?: number | null
  points?: number | null
  sparkid?: string | null
  reward?: string | null
}

export type PackageUpdate = Partial<PackageCreate>

export type PackageRead = {
  id: number
  sku: string
  name: string | null
  price: number | null
  points: number | null
  sparkid: string | null
  reward: string | null
}

export type Package = PackageRead

/** Data accepted by POST /api/packages. */
export type PackageCreate = {
  sku: string;
  name?: string | null;
  price?: number | null;
  points?: number | null;
  sparkid?: number | null;
  reward?: number | null;
};

/** Data accepted by PATCH /api/packages/{packageId}. */
export type PackageUpdate = Partial<PackageCreate>;

/** Package representation returned by the API. */
export type PackageRead = {
  id: number;
  sku: string;
  name: string | null;
  price: number | null;
  points: number | null;
  sparkid: number | null;
  reward: number | null;
};

export type PackageListParams = {
  offset?: number;
  limit?: number;
};

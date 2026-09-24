/** Decimal values are strings because the API serializes them losslessly. */
export type DecimalString = string;

type CrewOptionalFields = {
  file1?: string | null;
  file2?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  airline?: string | null;
  user_id?: number | null;
  file1_hash?: string | null;
  file2_hash?: string | null;
  reason?: string | null;
  confidence?: DecimalString | null;
  type?: string | null;
  dhash?: string | null;
  phash?: string | null;
  dhash_distance?: number | null;
  phash_distance?: number | null;
};

/** Data accepted by POST /api/crew. */
export type CrewCreate = CrewOptionalFields & {
  unique_id: string;
  iscrewid: boolean;
  createdate: string;
};

/** Data accepted by PATCH /api/crew/{crewId}. */
export type CrewUpdate = CrewOptionalFields & {
  unique_id?: string;
  iscrewid?: boolean;
  createdate?: string;
};

/** Crew representation returned by the API. */
export type CrewRead = Omit<CrewOptionalFields, "user_id"> & {
  id: number;
  unique_id: string;
  iscrewid: boolean;
  createdate: string;
  user_id: number | null;
};

export type CrewListParams = {
  offset?: number;
  limit?: number;
};

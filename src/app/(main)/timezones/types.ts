/** Data required by POST /api/timezones. */
export type TimezoneCreate = {
  name: string;
};

/** Data accepted by PATCH /api/timezones/{timezoneName}. */
export type TimezoneUpdate = {
  name?: string;
};

/** Timezone representation returned by the API. */
export type TimezoneRead = {
  name: string;
  created_at: string;
};

export type TimezoneListParams = {
  offset?: number;
  limit?: number;
};

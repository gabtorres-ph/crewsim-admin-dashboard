/** Data accepted by POST /api/languages. */
export type LanguageCreate = {
  iso1?: string | null;
  name: string;
};

/** Data required by PATCH /api/languages/{languageId}. */
export type LanguageUpdate = {
  iso1: string | null;
  name: string;
};

/** Language representation returned by the API. */
export type LanguageRead = LanguageUpdate & { id: number };

export type LanguageListParams = {
  offset?: number;
  limit?: number;
};

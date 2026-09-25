/** Data required by POST /api/currencies. */
export type CurrencyCreate = {
  code: string;
  name: string;
  symbol: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  iso_numeric: number;
};

/** Data accepted by PATCH /api/currencies/{currencyId}. */
export type CurrencyUpdate = Partial<CurrencyCreate>;

/** Currency representation returned by the API. */
export type CurrencyRead = CurrencyCreate & {
  id: number;
};

export type CurrencyListParams = {
  offset?: number;
  limit?: number;
};

/** Request log representation returned by GET /api/utils/request-logs. */
export type RequestLogEntry = {
  request_id: string;
  /** Epoch timestamp in milliseconds. */
  ts: number;
  timestamp: string | null;
  caller_ip: string;
  user_id: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  content_type: string | null;
  req_body_len: number;
  req_body_truncated: boolean;
  req_body_gzip: boolean;
  resp_content_type: string | null;
  resp_body_len: number | null;
  resp_body_truncated: boolean | null;
  resp_body_gzip: boolean | null;
};

/** Request log representation returned by GET /api/utils/request-logs/{request_id}. */
export type RequestLogDetail = {
  request_id: string;
  response_body: unknown;
};

export type RequestLogListResponse = {
  items: RequestLogEntry[];
  total: number;
  page: number;
  limit: number;
};

export type RequestLogListParams = {
  page?: number;
  limit?: number;
};

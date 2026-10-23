export type RoamingPlanRead = {
  id: number;
  roaming_plan_name: string | null;
};

export type RoamingPlanListParams = {
  offset?: number;
  limit?: number;
};

export type RoamingPlanRefreshResult = {
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
};

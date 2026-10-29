export type RoamingNetworkCode = {
  mcc: string;
  mnc: string;
};

export type RoamingPlanDetailRead = {
  roaming_plan_rule_id: number;
  roaming_plan_id: number;
  network_id: number;
  continent: string;
  country_name: string;
  country_iso2: string;
  operator_name: string;
  mcc_mncs: RoamingNetworkCode[];
  tadigs: string[];
  active: boolean;
  data_rate: string | null;
  start_date: string;
};

export type RoamingPlanDetailListParams = {
  offset?: number;
  limit?: number;
};

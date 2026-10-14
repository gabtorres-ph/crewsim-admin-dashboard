export type SimNotificationType = "location" | "ES2" | "package";

export type Es2NotificationPayload = {
  imsi: number | string;
  iccid?: string | null;
  eid?: string | null;
  subsId?: number | null;
  status?: string | null;
  [key: string]: unknown;
};

export type TelcovisionSubscriber = {
  imsi: number | string;
  iccid?: string | null;
  msisdn?: number | string | null;
  subscriberId?: number | null;
  [key: string]: unknown;
};

export type LocationNotificationPayload = {
  subscriber: TelcovisionSubscriber;
  additionalInfo?: Record<string, unknown> | null;
  mcc?: number | string | null;
  mnc?: number | string | null;
  [key: string]: unknown;
};

export type TelcovisionPrepaidPackage = {
  subscriberIMSI: number | string;
  unitsBefore?: number | null;
  unitsAfter?: number | null;
  thresholdPercentage?: number | string | null;
  thresholdUnits?: number | string | null;
  subscriberPackageId?: number | null;
  totalUnits?: number | null;
  subscriberId?: number | null;
  usageType?: string | null;
  [key: string]: unknown;
};

export type PackageNotificationPayload = {
  subscriberPrepaidPackage: TelcovisionPrepaidPackage;
  [key: string]: unknown;
};

type SimNotificationFields = {
  id: number;
  imsi: string;
  provider: "telcovision";
  createdate: string;
};

export type SimNotificationRead =
  | (SimNotificationFields & { typ: "ES2"; payload: Es2NotificationPayload })
  | (SimNotificationFields & {
      typ: "location";
      payload: LocationNotificationPayload;
    })
  | (SimNotificationFields & {
      typ: "package";
      payload: PackageNotificationPayload;
    });

export type SimNotificationListParams = {
  offset?: number;
  limit?: number;
  typ?: SimNotificationType;
  imsi?: string;
};

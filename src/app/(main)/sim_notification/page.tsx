import { fetchSimNotifications } from "./api";
import { SimNotificationsTable } from "./SimNotificationsTable";
import type { SimNotificationType } from "./types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const VALID_TYPES = new Set<SimNotificationType>(["location", "ES2", "package"]);

type SearchParams = Record<string, string | string[] | undefined>;

function singleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? undefined : value;
}

function parseOffset(value: string | undefined): number | undefined {
  if (value === undefined) return 0;
  if (!/^\d+$/.test(value)) return undefined;
  const offset = Number(value);
  return Number.isSafeInteger(offset) ? offset : undefined;
}

export default async function SimNotificationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const typValue = singleValue(searchParams.typ);
  const imsiValue = singleValue(searchParams.imsi)?.trim();
  const offsetValue = singleValue(searchParams.offset);
  const offset = parseOffset(offsetValue);

  let queryError: string | undefined;
  if (offset === undefined) queryError = "Offset must be a non-negative integer.";
  else if (typValue && !VALID_TYPES.has(typValue as SimNotificationType)) {
    queryError = "Choose a valid notification type.";
  } else if (imsiValue && !/^\d{5,15}$/.test(imsiValue)) {
    queryError = "IMSI must contain 5 to 15 digits.";
  }

  const typ = typValue as SimNotificationType | undefined;
  const notifications = queryError
    ? []
    : await fetchSimNotifications({
        offset,
        limit: PAGE_SIZE + 1,
        ...(typ && { typ }),
        ...(imsiValue && { imsi: imsiValue }),
      });

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        SIM Notifications
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <SimNotificationsTable
          notifications={notifications.slice(0, PAGE_SIZE)}
          hasNextPage={notifications.length > PAGE_SIZE}
          offset={offset ?? 0}
          pageSize={PAGE_SIZE}
          queryError={queryError}
          typ={queryError ? undefined : typ}
          imsi={queryError ? "" : imsiValue ?? ""}
        />
      </div>
    </>
  );
}

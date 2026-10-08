import { ApiLogsTable } from "./ApiLogsTable";
import { fetchRequestLogs } from "./api";

export const dynamic = "force-dynamic";

export default async function ApiLogsPage() {
  const { items, total } = await fetchRequestLogs({ page: 1, limit: 100 });

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        API Logs
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <ApiLogsTable logs={items} total={total} />
      </div>
    </>
  );
}

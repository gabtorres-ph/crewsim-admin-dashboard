import { fetchAllOffsetPages } from "@/lib/fetchAllPages";
import { UsageTable } from "./UsageTable";
import { fetchUsage } from "./api";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const usage = await fetchAllOffsetPages(fetchUsage);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Usage
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <UsageTable usage={usage} />
      </div>
    </>
  );
}

import { PackagesTable } from "./PackagesTable";
import { fetchPackages } from "./api";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await fetchPackages({ offset: 0, limit: 100 });

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Package Templates
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <PackagesTable packages={packages} />
      </div>
    </>
  );
}

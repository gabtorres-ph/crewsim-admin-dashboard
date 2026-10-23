import { fetchAllOffsetPages } from "@/lib/fetchAllPages";
import { fetchRoamingPlans } from "./api";
import { RoamingPlansTable } from "./RoamingPlansTable";

export const dynamic = "force-dynamic";

export default async function RoamingPlansPage() {
  const plans = await fetchAllOffsetPages(fetchRoamingPlans);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Roaming Plans
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <RoamingPlansTable plans={plans} />
      </div>
    </>
  );
}

import { fetchAllOffsetPages } from "@/lib/fetchAllPages";
import { fetchRoamingPlanDetails } from "./api";
import { RoamingPlanDetailsTable } from "./RoamingPlanDetailsTable";

export const dynamic = "force-dynamic";

export default async function RoamingPlanDetailsPage() {
  const details = await fetchAllOffsetPages(fetchRoamingPlanDetails);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Roaming Plan Details
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <RoamingPlanDetailsTable details={details} />
      </div>
    </>
  );
}

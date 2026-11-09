import { siteConfig } from "@/app/siteConfig";
import { redirect } from "next/navigation";
import { fetchRoamingPlanDetails } from "./api";
import { RoamingPlanDetailsTable } from "./RoamingPlanDetailsTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

export default async function RoamingPlanDetailsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = parsePage(searchParams.page);
  const { items, total } = await fetchRoamingPlanDetails({
    page,
    limit: PAGE_SIZE,
  });

  if (items.length === 0 && total > 0) {
    const lastPage = Math.ceil(total / PAGE_SIZE);
    redirect(`${siteConfig.baseLinks.roamingPlanDetails}?page=${lastPage}`);
  }

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Roaming Plan Details
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <RoamingPlanDetailsTable
          details={items}
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
        />
      </div>
    </>
  );
}

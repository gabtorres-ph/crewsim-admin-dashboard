import { notFound } from "next/navigation";

import { UsageForm } from "../../UsageForm";
import { updateUsageAction } from "../../actions";
import { fetchUsageRecord, UsageApiError } from "../../api";

export const dynamic = "force-dynamic";

async function getUsageOrNotFound(usageId: number) {
  try {
    return await fetchUsageRecord(usageId);
  } catch (error) {
    if (error instanceof UsageApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function EditUsagePage({
  params,
}: {
  params: { id: string };
}) {
  const usageId = Number(params.id);
  if (!Number.isInteger(usageId) || usageId <= 0) notFound();

  const usage = await getUsageOrNotFound(usageId);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Edit usage record {usage.id}
      </h1>
      <div className="mt-2 max-w-5xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update the usage event. Changes are sent to the Core API when saved.
        </p>
      </div>
      <div className="mt-6 max-w-5xl">
        <UsageForm
          usage={usage}
          submitAction={updateUsageAction.bind(null, usage.id)}
          submitLabel="Save changes"
        />
      </div>
    </>
  );
}

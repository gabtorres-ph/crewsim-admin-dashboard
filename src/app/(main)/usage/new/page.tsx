import { UsageForm } from "../UsageForm";

export default function NewUsagePage() {
  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Add usage record
      </h1>
      <div className="mt-2 max-w-5xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the complete usage event as provided by the source record.
        </p>
      </div>
      <div className="mt-6 max-w-5xl">
        <UsageForm />
      </div>
    </>
  );
}

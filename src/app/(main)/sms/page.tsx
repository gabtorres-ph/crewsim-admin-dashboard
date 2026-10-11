import { fetchAllOffsetPages } from "@/lib/fetchAllPages";
import { SmsTable } from "./SmsTable";
import { fetchSms } from "./api";

export const dynamic = "force-dynamic";

export default async function SmsPage() {
  const messages = await fetchAllOffsetPages(fetchSms);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        SMS
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <SmsTable messages={messages} />
      </div>
    </>
  );
}

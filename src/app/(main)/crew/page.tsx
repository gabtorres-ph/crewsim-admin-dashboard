import { fetchAllOffsetPages } from "@/lib/fetchAllPages";
import { CrewTable } from "./CrewTable";
import { fetchCrew } from "./api";

export const dynamic = "force-dynamic";

export default async function CrewPage() {
  const crew = await fetchAllOffsetPages(fetchCrew);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Crew
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <CrewTable crew={crew} />
      </div>
    </>
  );
}

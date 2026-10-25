
import { fetchAllOffsetPages } from "@/lib/fetchAllPages"
import { fetchUsers } from "../users/api"
import { EsimsTable } from "./EsimsTable"
import { fetchEsims } from "./api"

export const dynamic = "force-dynamic"

// TODO: Once eSIM responses include user_email, use it for read-only display and
// load user options only when editing. For large user lists, use a searchable,
// paginated select rather than raising fetchAllOffsetPages' 10,000-record guard.
export default async function ESimsPage() {
  const [esims, userOptions] = await Promise.all([
    fetchAllOffsetPages(fetchEsims),
    fetchAllOffsetPages(fetchUsers)
      .then((users) => ({
        users: users.map(({ id, email }) => ({ id, email })),
        usersError: undefined,
      }))
      .catch(() => ({
        users: [],
        usersError: "Could not load user emails. Refresh the page to try again.",
      })),
  ])

  return <><h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">eSIMs</h1><div className="mt-4 sm:mt-6 lg:mt-10"><EsimsTable esims={esims} users={userOptions.users} usersError={userOptions.usersError} /></div></>
}

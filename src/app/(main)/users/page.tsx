
import { fetchAllOffsetPages } from "@/lib/fetchAllPages"
import { fetchUsers } from "./api"
import { UsersTable } from "./UsersTable"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const users = await fetchAllOffsetPages(fetchUsers)

  return <>
    <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">Users</h1>
    <div className="mt-4 sm:mt-6 lg:mt-10"><UsersTable users={users} /></div>
  </>
}

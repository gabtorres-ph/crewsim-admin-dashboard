import { fetchAllOffsetPages } from "@/lib/fetchAllPages"
import { AccountsTable } from "./AccountsTable"
import { fetchAccounts } from "./api"

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const accounts = await fetchAllOffsetPages(fetchAccounts)

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Accounts
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <AccountsTable accounts={accounts} />
      </div>
    </>
  )
}

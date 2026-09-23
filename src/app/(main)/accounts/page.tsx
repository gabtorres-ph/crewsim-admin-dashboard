import { AccountsTable } from "./AccountsTable"
import { fetchAccounts } from "./api"

export default async function AccountsPage() {
  const accounts = await fetchAccounts({ offset: 0, limit: 100 })

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

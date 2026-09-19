import { listLanguages } from '../api'
import { ResourceTablePage } from '@/shared/ui'
import { columns } from "@/features/languages/components/columns"

function loadLanguages() {
  return listLanguages({ offset:0, limit: 100})
}

export function LanguagesPage() {
    return (
      <ResourceTablePage
        title="Languages"
        description='View and manage languages'
        columns={columns}
        load={loadLanguages}
      />
    // <section className="mx-auto w-full">
    //   <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    //     <div>
    //       <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
    //         Languages
    //       </h1>
    //       <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
    //         View and manage available languages
    //       </p>
    //     </div>
    //   </header>
    // </section>
    )
}
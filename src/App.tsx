import { useState } from 'react'

import { Sidebar } from './components/Sidebar'
import { EsimsPage } from '@/features/esims'
import { AccountsPage } from '@/features/accounts'
import { UsersPage } from '@/features/users'

type Section = 'users' | 'accounts' | 'esims'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('users')

  return (
    <div className="dark min-h-screen bg-gray-950 md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="min-w-0 bg-gray-950 p-5 md:p-10">
        {activeSection === 'accounts' && <AccountsPage />}

        {activeSection === 'users' && <UsersPage />}

        {activeSection === 'esims' && <EsimsPage />}
      </main>
    </div>
  )
}

export default App

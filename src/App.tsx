import { useState } from 'react'

import { Sidebar } from './components/Sidebar'
import { UsersPage } from './pages/UsersPage'

type Section = 'users' | 'esims'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('users')

  return (
    <div className="dark min-h-screen bg-gray-950 md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="min-w-0 bg-[#050914] p-5 md:p-10">
        {activeSection === 'users' && <UsersPage />}

        {activeSection === 'esims' && (
          <section className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-semibold text-white">eSIMs</h1>
            <p className="mt-2 text-sm text-gray-400">
              eSIM management will be added when its requirements are available.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App

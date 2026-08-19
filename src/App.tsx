import { useState } from 'react'

import { Sidebar } from './components/Sidebar'
import { EsimsPage } from './pages/EsimsPage'
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

        {activeSection === 'esims' && <EsimsPage />}
      </main>
    </div>
  )
}

export default App

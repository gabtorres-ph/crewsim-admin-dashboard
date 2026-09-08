import { useState } from 'react'

import { EsimsPage } from '@/features/esims'
import { AccountsPage } from '@/features/accounts'
import { UsersPage } from '@/features/users'
import { FavoritesPage } from '@/features/favorites'
import { PackagesPage } from '@/features/packages'
import { UsagePage } from '@/features/usage'
import { CrewPage } from '@/features/crew'
import { Sidebar } from './components/Sidebar'
import { useTheme, type Theme } from './theme'

type Section = 'users' | 'accounts' | 'esims' | 'favorites' | 'packages' | 'usage' | 'crew'

type AppProps = {
  initialTheme?: Theme
}

function App({ initialTheme = 'light' }: AppProps) {
  const [activeSection, setActiveSection] = useState<Section>('users')
  const [theme, setTheme] = useTheme(initialTheme)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="min-w-0 bg-gray-50 p-5 dark:bg-gray-950 md:p-10">
        {activeSection === 'accounts' && <AccountsPage />}

        {activeSection === 'users' && <UsersPage />}

        {activeSection === 'esims' && <EsimsPage />}

        {activeSection === 'favorites' && <FavoritesPage />}

        {activeSection === 'packages' && <PackagesPage />}

        {activeSection === 'usage' && <UsagePage />}

        {activeSection === 'crew' && <CrewPage />}
      </main>
    </div>
  )
}

export default App

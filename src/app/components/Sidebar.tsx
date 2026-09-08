import { 
  RiBankLine, 
  RiSimCardLine, 
  RiUserLine, 
  RiStarLine,
  RiRedPacketFill,
  RiHourglassLine,
  RiMoonLine,
  RiPlaneLine,
  RiSunLine,
} from '@remixicon/react'

import type { Theme } from '@/app/theme'
import { cx } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'

type Section = 'users' | 'accounts' | 'esims' | 'favorites' | 'packages' | 'usage' | 'crew'

type SidebarProps = {
  activeSection: Section
  onSectionChange: (section: Section) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const navigationItems = [
  { id: 'accounts', label: 'Accounts', icon: RiBankLine },
  { id: 'users', label: 'Users', icon: RiUserLine },
  { id: 'esims', label: 'eSIMs', icon: RiSimCardLine },
  { id: 'favorites', label: 'Favorites', icon: RiStarLine },
  { id: 'packages', label: 'Packages', icon: RiRedPacketFill },
  { id: 'usage', label: 'Usage', icon: RiHourglassLine },
  { id: 'crew', label: 'Crew', icon: RiPlaneLine }
] as const

export function Sidebar({
  activeSection,
  onSectionChange,
  theme,
  onThemeChange,
}: SidebarProps) {
  const isDark = theme === 'dark'

  return (
    <aside className="border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:min-h-screen md:border-r md:border-b-0 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3 md:mb-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-md bg-indigo-500 font-semibold text-white">
            CS
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">CrewSim</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin dashboard</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
          className="shrink-0 p-2"
        >
          {isDark ? (
            <RiSunLine className="size-5" aria-hidden="true" />
          ) : (
            <RiMoonLine className="size-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      <nav className="flex gap-2 md:flex-col" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={cx(
                'w-full justify-start gap-3 border-transparent text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50',
                isActive &&
                  'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-200',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}

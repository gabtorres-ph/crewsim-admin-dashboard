import { RiSimCardLine, RiUserLine } from '@remixicon/react'

import { cx } from '../lib/utils'
import { Button } from './ui/Button'

type Section = 'users' | 'esims'

type SidebarProps = {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

const navigationItems = [
  { id: 'users', label: 'Users', icon: RiUserLine },
  { id: 'esims', label: 'eSIMs', icon: RiSimCardLine },
] as const

export function Sidebar({
  activeSection,
  onSectionChange,
}: SidebarProps) {
  return (
    <aside className="border-b border-gray-800 bg-gray-950 p-4 md:min-h-screen md:border-r md:border-b-0 md:p-5">
      <div className="mb-5 flex items-center gap-3 md:mb-10">
        <div className="grid size-10 place-items-center rounded-md bg-indigo-500 font-semibold text-white">
          CS
        </div>

        <div>
          <p className="font-semibold text-white">CrewSim</p>
          <p className="text-xs text-gray-400">Admin dashboard</p>
        </div>
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
                'w-full justify-start gap-3 border-transparent text-gray-400 dark:text-gray-400',
                isActive &&
                  'bg-indigo-950 text-indigo-300 hover:bg-indigo-950 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-950',
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

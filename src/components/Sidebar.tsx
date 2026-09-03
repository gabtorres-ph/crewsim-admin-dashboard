import { RiBankLine, RiSimCardLine, RiUserLine } from '@remixicon/react'

import { cx } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'

type Section = 'users' | 'accounts' | 'esims'

type SidebarProps = {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

const navigationItems = [
  { id: 'accounts', label: 'Accounts', icon: RiBankLine },
  { id: 'users', label: 'Users', icon: RiUserLine },
  { id: 'esims', label: 'eSIMs', icon: RiSimCardLine },
] as const

export function Sidebar({
  activeSection,
  onSectionChange,
}: SidebarProps) {
  return (
    <aside className="border-b border-gray-800 bg-gray-950 p-4 shadow-sm md:min-h-screen md:border-r md:border-b-0 md:p-5">
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
                'w-full justify-start gap-3 border-transparent text-gray-400 hover:text-gray-50',
                isActive &&
                  'border-blue-500/20 bg-blue-500/15 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200',
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

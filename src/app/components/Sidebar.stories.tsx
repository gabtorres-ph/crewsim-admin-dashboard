import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { Sidebar } from './Sidebar'

const meta = {
  title: 'App/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    activeSection: 'users',
    onSectionChange: fn(),
    theme: 'light',
    onThemeChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:w-60">
        <Story />
      </div>
    ),
  ],
  render: (args, context) => (
    <Sidebar
      {...args}
      theme={context.globals.theme === 'dark' ? 'dark' : 'light'}
    />
  ),
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const UsersActive: Story = {}

export const AccountsActive: Story = {
  args: {
    activeSection: 'accounts',
  },
}

export const EsimsActive: Story = {
  args: {
    activeSection: 'esims',
  },
}

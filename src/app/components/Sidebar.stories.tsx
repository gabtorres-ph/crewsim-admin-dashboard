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
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-gray-950 md:w-60">
        <Story />
      </div>
    ),
  ],
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

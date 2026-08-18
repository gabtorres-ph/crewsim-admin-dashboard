import type { Meta, StoryObj } from '@storybook/react-vite'

import { UsersPage } from './UsersPage'

const meta = {
  title: 'Pages/UsersPage',
  component: UsersPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <main className="dark min-h-screen bg-[#050914] p-5 md:p-10">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof UsersPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

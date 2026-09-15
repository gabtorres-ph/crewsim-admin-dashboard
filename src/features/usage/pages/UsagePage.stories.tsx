import type { Meta, StoryObj } from '@storybook/react-vite'

import { UsagePage } from './UsagePage'

const meta = {
  title: 'Pages/UsagePage',
  component: UsagePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-gray-50 p-5 dark:bg-gray-950 md:p-10">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof UsagePage>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

import type { Meta, StoryObj } from '@storybook/react-vite'

import { FavoritesPage } from './FavoritesPage'

const meta = {
  title: 'Pages/FavoritesPage',
  component: FavoritesPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-gray-50 p-5 dark:bg-gray-950 md:p-10">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof FavoritesPage>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

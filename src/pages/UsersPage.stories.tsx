import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'

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

export const Populated: Story = {}

export const Empty: Story = {
  parameters: {
    msw: [
      http.get('*/users', () => HttpResponse.json([])),
    ],
  },
}

export const Loading: Story = {
  parameters: {
    msw: [
      http.get('*/users', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    ],
  },
}

export const Error: Story = {
  parameters: {
    msw: [
      http.get('*/users', () =>
        HttpResponse.json(
          { detail: 'The user service is temporarily unavailable.' },
          { status: 503 },
        ),
      ),
    ],
  },
}

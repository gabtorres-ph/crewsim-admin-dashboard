import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'
import { expect, userEvent, within } from 'storybook/test'

import { accountHandlers } from '../mocks/handlers/accounts'
import { esimHandlers } from '../mocks/handlers/esims'
import { userHandlers } from '../mocks/handlers/users'
import { AccountsPage } from './AccountsPage'

const meta = {
  title: 'Pages/AccountsPage',
  component: AccountsPage,
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
} satisfies Meta<typeof AccountsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const Empty: Story = {
  parameters: {
    msw: [
      http.get('*/accounts', () => HttpResponse.json([])),
      ...userHandlers,
    ],
  },
}

export const Loading: Story = {
  parameters: {
    msw: [
      http.get('*/accounts', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
      ...userHandlers,
    ],
  },
}

export const Error: Story = {
  parameters: {
    msw: [
      http.get('*/accounts', () =>
        HttpResponse.json(
          { detail: 'The account service is temporarily unavailable.' },
          { status: 503 },
        ),
      ),
      ...userHandlers,
    ],
  },
}

export const DeleteConflict: Story = {
  parameters: {
    msw: [
      http.delete('*/accounts/:id', () =>
        HttpResponse.json(
          { detail: 'The account cannot be deleted while it is referenced by other data.' },
          { status: 409 },
        ),
      ),
      ...accountHandlers,
      ...esimHandlers,
      ...userHandlers,
    ],
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)
    const originalConfirm = window.confirm
    window.confirm = () => true

    try {
      await screen.findByRole('heading', { name: 'Accounts' })
      await userEvent.click(
        screen.getByRole('button', { name: 'Delete Pacific Operations' }),
      )
      await expect(
        screen.findByRole('alert'),
      ).resolves.toHaveTextContent('cannot be deleted')
    } finally {
      window.confirm = originalConfirm
    }
  },
}

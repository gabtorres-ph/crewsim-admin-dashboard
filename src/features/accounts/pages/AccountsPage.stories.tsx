import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'
import { expect, userEvent, within } from 'storybook/test'

import { accountHandlers } from '../mocks'
import { esimHandlers } from '@/features/esims/mocks'
import { userHandlers } from '@/features/users/mocks'
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

export const SearchUsesOriginalFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Accounts' })
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search accounts' }),
      '12450.75',
    )

    await expect(canvas.getByText('Pacific Operations')).toBeVisible()
    await expect(
      canvas.queryByText('Singapore Flight Crew'),
    ).not.toBeInTheDocument()
    await expect(canvas.getByText('1 result')).toBeVisible()

    const tableSelects = canvas.getAllByRole('combobox')
    await expect(tableSelects).toHaveLength(1)
    await expect(tableSelects[0]).toHaveAccessibleName('Rows per page')
  },
}

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

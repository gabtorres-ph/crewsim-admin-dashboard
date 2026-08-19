import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'
import { expect, userEvent, within } from 'storybook/test'

import { esimHandlers } from '../mocks/handlers/esims'
import { userHandlers } from '../mocks/handlers/users'
import { EsimsPage } from './EsimsPage'

const meta = {
  title: 'Pages/EsimsPage',
  component: EsimsPage,
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
} satisfies Meta<typeof EsimsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const Empty: Story = {
  parameters: {
    msw: [
      http.get('*/esims', () => HttpResponse.json([])),
      ...userHandlers,
    ],
  },
}

export const Loading: Story = {
  parameters: {
    msw: [
      http.get('*/esims', async () => {
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
      http.get('*/esims', () =>
        HttpResponse.json(
          { detail: 'The eSIM service is temporarily unavailable.' },
          { status: 503 },
        ),
      ),
      ...userHandlers,
    ],
  },
}

export const FilteredEmpty: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)

    await screen.findByRole('heading', { name: 'eSIMs' })
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search eSIMs' }),
      'does-not-exist',
    )

    await expect(
      screen.getByText('No eSIMs match your search.'),
    ).toBeVisible()
  },
}

export const SaveError: Story = {
  parameters: {
    msw: [
      http.post('*/esims', () =>
        HttpResponse.json(
          { detail: 'An eSIM with this IMSI already exists.' },
          { status: 409 },
        ),
      ),
      ...userHandlers,
      ...esimHandlers,
    ],
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)

    await screen.findByRole('heading', { name: 'eSIMs' })
    await userEvent.click(
      screen.getByRole('button', { name: 'Add eSIM' }),
    )

    const dialog = await screen.findByRole('dialog')
    const form = within(dialog)
    await userEvent.selectOptions(
      form.getByRole('combobox', { name: 'User' }),
      'alex.santos@example.com',
    )
    await userEvent.type(
      form.getByRole('textbox', { name: 'IMSI' }),
      '310150999888777',
    )
    await userEvent.click(
      form.getByRole('button', { name: 'Add eSIM' }),
    )

    const alert = await form.findByRole('alert')
    await expect(alert).toHaveTextContent(
      'An eSIM with this IMSI already exists.',
    )
  },
}

export const DeleteError: Story = {
  parameters: {
    msw: [
      http.delete('*/esims/:id', () =>
        HttpResponse.json(
          { detail: 'The eSIM could not be deleted.' },
          { status: 503 },
        ),
      ),
      ...userHandlers,
      ...esimHandlers,
    ],
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)
    const originalConfirm = window.confirm
    window.confirm = () => true

    try {
      await screen.findByRole('heading', { name: 'eSIMs' })
      await userEvent.click(
        screen.getAllByRole('button', { name: /Delete eSIM/ })[0],
      )

      const alert = await screen.findByRole('alert')
      await expect(alert).toHaveTextContent(
        'The eSIM could not be deleted.',
      )
    } finally {
      window.confirm = originalConfirm
    }
  },
}

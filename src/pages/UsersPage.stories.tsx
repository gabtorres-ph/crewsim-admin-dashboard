import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'
import { expect, userEvent, within } from 'storybook/test'

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

export const SearchAndCategoricalFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Users' })

    const search = canvas.getByRole('searchbox', { name: 'Search users' })
    const language = canvas.getByRole('combobox', { name: 'Language' })
    const currency = canvas.getByRole('combobox', { name: 'Currency' })
    const timezone = canvas.getByRole('combobox', { name: 'Timezone' })

    // The ID belongs to a row on the second unfiltered page, proving search
    // covers the complete loaded collection rather than only visible rows.
    await userEvent.type(search, '1018')
    await expect(canvas.getByText('ella.wilson@example.com')).toBeVisible()
    await expect(canvas.getByText('1 result')).toBeVisible()
    await userEvent.clear(search)

    await userEvent.selectOptions(language, 'en')
    await expect(canvas.getByText('6 results')).toBeVisible()
    await userEvent.selectOptions(language, '')

    await userEvent.selectOptions(currency, 'EUR')
    await expect(canvas.getByText('5 results')).toBeVisible()
    await userEvent.selectOptions(currency, '')

    await userEvent.selectOptions(timezone, 'Europe/Dublin')
    await expect(canvas.getByText('1 result')).toBeVisible()
    await expect(canvas.getByText('liam.oconnor@example.com')).toBeVisible()
    await userEvent.selectOptions(timezone, '')

    await userEvent.selectOptions(language, 'en')
    await userEvent.selectOptions(currency, 'EUR')
    await expect(canvas.getByText('1 result')).toBeVisible()
    await expect(canvas.getByText('liam.oconnor@example.com')).toBeVisible()

    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit liam.oconnor@example.com' }),
    )
    await expect(
      within(canvasElement.ownerDocument.body).getByRole('heading', {
        name: 'Edit user',
      }),
    ).toBeInTheDocument()
  },
}

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

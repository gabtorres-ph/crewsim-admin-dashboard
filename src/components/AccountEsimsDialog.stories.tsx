import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'

import { mockAccounts } from '../mocks/data/accounts'
import { mockUsers } from '../mocks/data/users'
import { AccountEsimsDialog } from './AccountEsimsDialog'

const meta = {
  title: 'Components/AccountEsimsDialog',
  component: AccountEsimsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    account: mockAccounts[0],
    users: mockUsers,
    open: true,
    onOpenChange: () => undefined,
  },
} satisfies Meta<typeof AccountEsimsDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const Empty: Story = {
  args: {
    account: {
      id: 3999,
      name: 'Empty account',
      balance: 0,
    },
  },
  parameters: {
    msw: [
      http.get('*/accounts/3999/esims', () => HttpResponse.json([])),
    ],
  },
}

export const Error: Story = {
  parameters: {
    msw: [
      http.get('*/accounts/:id/esims', () =>
        HttpResponse.json(
          { detail: 'Unable to load eSIMs.' },
          { status: 503 },
        ),
      ),
    ],
  },
}

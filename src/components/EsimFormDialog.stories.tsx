import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/shared/ui/Button'

import { mockAccounts } from '@/features/accounts/mocks'
import { mockEsims } from '../mocks/data/esims'
import { mockUsers } from '@/features/users/mocks'
import type { EsimInput } from '../types/esims'
import { EsimFormDialog } from './EsimFormDialog'

const users = mockUsers.slice(0, 4)
const accounts = mockAccounts.slice(0, 4)

const meta = {
  title: 'Components/EsimFormDialog',
  component: EsimFormDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    mode: 'add',
    esim: null,
    accounts,
    users,
    open: true,
    saving: false,
    error: null,
    onOpenChange: () => undefined,
    onSubmit: fn(async (_input: EsimInput) => undefined),
  },
} satisfies Meta<typeof EsimFormDialog>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveDialog(
  args: React.ComponentProps<typeof EsimFormDialog>,
) {
  const [open, setOpen] = useState(args.open)

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <EsimFormDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (input) => {
          await args.onSubmit(input)
          setOpen(false)
        }}
      />
    </>
  )
}

export const Add: Story = {
  render: (args) => <InteractiveDialog {...args} />,
  play: async ({ args, canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Account' }),
      '3001',
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'User' }),
      '1001',
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'IMSI' }),
      '310150111222333',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Add eSIM' }),
    )

    await expect(args.onSubmit).toHaveBeenCalledWith({
      userId: 1001,
      accountId: 3001,
      imsi: '310150111222333',
    })
  },
}

export const Edit: Story = {
  args: {
    mode: 'edit',
    esim: {
      ...mockEsims[0],
      id: 2001,
      userId: 1001,
      accountId: 3001,
      imsi: '310150123456789',
    },
  },
  render: (args) => <InteractiveDialog {...args} />,
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)

    await expect(
      screen.getByRole('combobox', { name: 'User' }),
    ).toHaveValue('1001')
    await expect(
      screen.getByRole('combobox', { name: 'Account' }),
    ).toHaveValue('3001')
    await expect(
      screen.getByRole('textbox', { name: 'IMSI' }),
    ).toHaveValue('310150123456789')
  },
}

export const Saving: Story = {
  args: {
    saving: true,
  },
}

export const InlineValidation: Story = {
  render: (args) => <InteractiveDialog {...args} />,
  play: async ({ args, canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)

    await userEvent.click(
      screen.getByRole('button', { name: 'Add eSIM' }),
    )

    await waitFor(() => {
      expect(screen.getByText('Account is required.')).toBeVisible()
      expect(screen.getByText('IMSI is required.')).toBeVisible()
    })
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const WithApiError: Story = {
  args: {
    error: 'An eSIM with this IMSI already exists.',
  },
}

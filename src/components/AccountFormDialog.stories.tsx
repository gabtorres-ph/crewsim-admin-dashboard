import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/shared/ui/Button'

import { mockAccounts } from '../mocks/data/accounts'
import type { AccountCreateInput } from '../types/accounts'
import { AccountFormDialog } from './AccountFormDialog'

const meta = {
  title: 'Components/AccountFormDialog',
  component: AccountFormDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    mode: 'add',
    account: null,
    open: true,
    saving: false,
    error: null,
    onOpenChange: () => undefined,
    onSubmit: fn(async (_input: AccountCreateInput) => undefined),
  },
} satisfies Meta<typeof AccountFormDialog>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveDialog(
  args: React.ComponentProps<typeof AccountFormDialog>,
) {
  const [open, setOpen] = useState(args.open)

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <AccountFormDialog
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

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Test account',
    )
    await userEvent.type(
      screen.getByRole('spinbutton', { name: 'Balance' }),
      '1250.5',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Add account' }),
    )

    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Test account',
      balance: 1250.5,
    })
  },
}

export const Edit: Story = {
  args: {
    mode: 'edit',
    account: mockAccounts[0],
  },
  render: (args) => <InteractiveDialog {...args} />,
}

export const Validation: Story = {
  render: (args) => <InteractiveDialog {...args} />,
  play: async ({ args, canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)

    await userEvent.click(
      screen.getByRole('button', { name: 'Add account' }),
    )

    await expect(screen.getByText('Name is required.')).toBeVisible()
    await expect(
      screen.getByText('Balance must be a finite number.'),
    ).toBeVisible()
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const WithApiError: Story = {
  args: {
    error: 'The account conflicts with existing database data.',
  },
}

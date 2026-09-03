import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/shared/ui/Button'

import { mockUsers } from '../mocks/data/users'
import type { UserInput } from '../types/user'
import { UserFormDialog } from './UserFormDialog'

const meta = {
  title: 'Components/UserFormDialog',
  component: UserFormDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    mode: 'add',
    user: null,
    open: true,
    saving: false,
    error: null,
    onOpenChange: () => undefined,
    onSubmit: fn(async (_input: UserInput) => undefined),
  },
} satisfies Meta<typeof UserFormDialog>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveDialog(
  args: React.ComponentProps<typeof UserFormDialog>,
) {
  const [open, setOpen] = useState(args.open)

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <UserFormDialog
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
      screen.getByRole('textbox', { name: 'Email' }),
      'new.user@example.com',
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Language' }),
      'de',
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Currency' }),
      'EUR',
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Timezone' }),
      'Europe/Berlin',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add user' }))

    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: 'new.user@example.com',
      language: 'de',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
    })
  },
}

export const Edit: Story = {
  args: {
    mode: 'edit',
    user: {
      ...mockUsers[0],
      id: 42,
      email: 'alex@example.com',
      language: 'en',
      currency: 'USD',
      timezone: 'Asia/Manila',
    },
  },
  render: (args) => <InteractiveDialog {...args} />,
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement.ownerDocument.body)

    await expect(
      screen.getByRole('textbox', { name: 'Email' }),
    ).toHaveValue('alex@example.com')
    await expect(
      screen.getByRole('textbox', { name: 'Language' }),
    ).toHaveValue('en')
    await expect(
      screen.getByRole('textbox', { name: 'Currency' }),
    ).toHaveValue('USD')
    await expect(
      screen.getByRole('textbox', { name: 'Timezone' }),
    ).toHaveValue('Asia/Manila')
  },
}

export const Saving: Story = {
  args: {
    saving: true,
  },
}

export const WithError: Story = {
  args: {
    error: 'A user with this email already exists.',
  },
}

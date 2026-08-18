import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import type { UserInput } from '../types/user'
import { Button } from './ui/Button'
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
    onSubmit: async (_input: UserInput) => undefined,
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
        onSubmit={async () => setOpen(false)}
      />
    </>
  )
}

export const Add: Story = {
  render: (args) => <InteractiveDialog {...args} />,
}

export const Edit: Story = {
  args: {
    mode: 'edit',
    user: {
      id: 42,
      email: 'alex@example.com',
      language: 'en',
      currency: 'USD',
      timezone: 'Asia/Manila',
    },
  },
  render: (args) => <InteractiveDialog {...args} />,
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

import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

const meta = {
  title: 'Components/UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update the details below, then save your changes.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <label className="block">
            <span className="mb-1.5 block font-medium">Display name</span>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-800 dark:bg-gray-950"
              defaultValue="Alex Morgan"
            />
          </label>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
}

export const DestructiveConfirmation: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete user</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this user?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The user will permanently lose access.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete user</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

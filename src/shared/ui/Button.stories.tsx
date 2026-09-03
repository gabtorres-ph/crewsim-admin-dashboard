import type { Meta, StoryObj } from '@storybook/react-vite'
import { RiAddLine } from '@remixicon/react'

import { Button } from './Button'

const meta = {
  title: 'Components/UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'light', 'ghost', 'destructive'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Light: Story = {
  args: { variant: 'light' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete user',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    loadingText: 'Saving',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <RiAddLine className="mr-1.5 size-4" aria-hidden="true" />
        Add user
      </>
    ),
  },
}

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#button-link">Open link</a>
    </Button>
  ),
}

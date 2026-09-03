import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from './Input'

const meta = {
  title: 'Components/UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    placeholder: 'Enter a value',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search users...',
    'aria-label': 'Search users',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    defaultValue: 'correct horse battery staple',
    'aria-label': 'Password',
  },
}

export const NumberWithoutStepper: Story = {
  args: {
    type: 'number',
    enableStepper: false,
    defaultValue: 24,
    'aria-label': 'Quantity',
  },
}

export const Error: Story = {
  args: {
    hasError: true,
    defaultValue: 'not-an-email',
    'aria-invalid': true,
    'aria-label': 'Email address with an error',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This field is disabled',
  },
}

export const File: Story = {
  args: {
    type: 'file',
    'aria-label': 'Upload file',
    placeholder: undefined,
  },
}

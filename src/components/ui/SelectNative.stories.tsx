import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectNative } from './SelectNative'

const currencies = ['USD', 'EUR', 'GBP', 'PHP']

const meta = {
  title: 'Components/UI/SelectNative',
  component: SelectNative,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    'aria-label': 'Currency',
    defaultValue: 'USD',
  },
  render: (args) => (
    <SelectNative {...args}>
      {currencies.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </SelectNative>
  ),
} satisfies Meta<typeof SelectNative>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Error: Story = {
  args: {
    hasError: true,
    'aria-invalid': true,
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

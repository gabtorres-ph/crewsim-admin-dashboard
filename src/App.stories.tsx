import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import App from './App'

const meta = {
  title: 'App/CrewSim',
  component: App,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const EsimsNavigation: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)

    await userEvent.click(
      screen.getByRole('button', { name: 'eSIMs' }),
    )

    await expect(
      screen.findByRole('heading', { name: 'eSIMs' }),
    ).resolves.toBeVisible()
    await expect(
      screen.findByRole('columnheader', { name: 'IMSI' }),
    ).resolves.toBeVisible()
  },
}

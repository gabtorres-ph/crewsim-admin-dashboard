import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import App from './App'
import {
  applyTheme,
  initializeTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
} from './theme'

const meta = {
  title: 'App/CrewSim',
  component: App,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args, context) => (
    <App
      {...args}
      initialTheme={
        args.initialTheme ?? (context.globals.theme === 'dark' ? 'dark' : 'light')
      }
    />
  ),
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ThemeSwitching: Story = {
  args: {
    initialTheme: 'light',
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    const root = canvasElement.ownerDocument.documentElement

    await expect(root).not.toHaveClass('dark')

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    )

    await expect(root).toHaveClass('dark')
    await expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeVisible()
    await expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    )

    await expect(root).not.toHaveClass('dark')
    await expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    window.localStorage.setItem(THEME_STORAGE_KEY, 'invalid')
    await expect(readStoredTheme()).toBe('light')

    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    await expect(readStoredTheme()).toBe('dark')
    await expect(initializeTheme()).toBe('dark')
    await expect(root).toHaveClass('dark')

    applyTheme('light', false)
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  },
}

export const SavedDarkPreference: Story = {
  args: {
    initialTheme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)

    await expect(canvasElement.ownerDocument.documentElement).toHaveClass('dark')
    await expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeVisible()
    await expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  },
}

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

export const AccountsNavigation: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)

    await userEvent.click(
      screen.getByRole('button', { name: 'Accounts' }),
    )

    await expect(
      screen.findByRole('heading', { name: 'Accounts' }),
    ).resolves.toBeVisible()
    await expect(
      screen.findByRole('columnheader', { name: 'Balance' }),
    ).resolves.toBeVisible()
  },
}

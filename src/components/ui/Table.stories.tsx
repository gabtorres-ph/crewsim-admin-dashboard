import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './Table'

const users = [
  {
    id: 1001,
    email: 'alex@example.com',
    language: 'English',
    currency: 'USD',
  },
  {
    id: 1002,
    email: 'bea@example.com',
    language: 'Filipino',
    currency: 'PHP',
  },
  {
    id: 1003,
    email: 'charlie@example.com',
    language: 'French',
    currency: 'EUR',
  },
]

const meta = {
  title: 'Components/UI/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <TableRoot>
      <Table {...args}>
        <TableCaption>A list of CrewSim users.</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Language</TableHeaderCell>
            <TableHeaderCell>Currency</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                {user.email}
              </TableCell>
              <TableCell>{user.language}</TableCell>
              <TableCell>{user.currency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableRoot>
  ),
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithFooter: Story = {
  render: (args) => (
    <TableRoot>
      <Table {...args}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Currency</TableHeaderCell>
            <TableHeaderCell className="text-right">Users</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>USD</TableCell>
            <TableCell className="text-right">18</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>PHP</TableCell>
            <TableCell className="text-right">7</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">25</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    </TableRoot>
  ),
}

import { useEffect, useMemo, useState } from 'react'

import { listUsers } from '../api/users'
import { Input } from '../components/ui/Input'
import type {
  SortDirection,
  User,
  UserSortKey,
} from '../types/user'

type DialogMode = 'add' | 'edit' | null

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<UserSortKey>('id')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    setPageError(null)

    try {
      const result = await listUsers()
      setUsers(result)
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Unable to load users',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) =>
      [
        user.id,
        user.email,
        user.language,
        user.currency,
        user.timezone,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [users, search])

  // Later plan steps connect the remaining state to UI controls. Keep each
  // value and setter referenced while this page remains a placeholder.
  void filteredUsers
  void sortKey
  void setSortKey
  void sortDirection
  void setSortDirection
  void loading
  void pageError
  void dialogMode
  void setDialogMode
  void selectedUser
  void setSelectedUser
  void saving
  void setSaving
  void formError
  void setFormError

  return (
    <section className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold text-white">Users</h1>
      <p className="mt-2 text-sm text-gray-400">
        User management will be added in the next implementation steps.
      </p>

      <Input
        type="search"
        value={search}
        placeholder="Search users..."
        aria-label="Search users"
        onChange={(event) => setSearch(event.target.value)}
        className="mt-6 w-full sm:max-w-sm"
      />
    </section>
  )
}

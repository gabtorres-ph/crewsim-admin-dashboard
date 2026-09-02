export type Account = {
  id: number
  name: string
  balance: number
}

export type AccountCreateInput = {
  name: string
  balance: number
}

export type AccountUpdateInput = Partial<AccountCreateInput>

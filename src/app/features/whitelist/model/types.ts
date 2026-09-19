export type EmailWhitelistCreate = {
  email: string
  status: string
}

export type EmailWhitelistUpdate = Partial<EmailWhitelistCreate>

export type EmailWhitelistRead = EmailWhitelistCreate & {
  id: number
  createdate: string
}

export type EmailWhitelist = EmailWhitelistRead

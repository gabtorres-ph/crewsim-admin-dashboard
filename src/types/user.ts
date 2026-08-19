
export type User = {
    id: number
    email: string
    currency: string
    language: string
    timezone: string
}

export type UserInput = {
    email: string
    currency: string
    language: string
    timezone: string
}

export type UserSortKey = 
    | 'id'
    | 'email'
    | 'currency'
    | 'language'
    | 'timezone'

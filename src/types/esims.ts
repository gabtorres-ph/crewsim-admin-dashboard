
export type ESim = {
    id: number
    user: string // user email
    imsi: string
}

export type ESimInput = {
    user: string
    imsi: string
}

export type ESimSortKey = 
    | 'id'
    | 'user'
    | 'imsi'
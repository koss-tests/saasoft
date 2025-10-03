export enum ACCOUNT_TYPE {
  LOCAL = 'local',
  LDAP = 'LDAP'
}

export interface AccountTag {
  text: string
}

export interface Account {
  id: string
  login: string
  password: string | null
  type: ACCOUNT_TYPE
  tags: AccountTag[]
}

export interface AccountState {
  valid: boolean
  accounts: Account[]
}

export interface AccountValidationErrors {
  tags: string[]
  login: string[]
  password: string[]
}

export interface AccountTypeOption {
  label: string
  value: ACCOUNT_TYPE
}

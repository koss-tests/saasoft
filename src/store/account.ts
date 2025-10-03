import { defineStore } from 'pinia'
import { ACCOUNT_TYPE } from '../shared/types'
import type { Account } from '../shared/types'
import { SafeLocalStorage } from '../shared/utils'
import { isAccountsArrayStrict } from '../shared/validators/account'

interface AccountState {
  hasUnsavedAccounts: boolean
  accounts: Account[]
}

const STORAGE_KEY = 'accounts'

const getLocalStorageAccountsConfig = {
  validator: isAccountsArrayStrict,
  onError: (error: Error) => {
    console.error('Invalid accounts data:', error.message)
    // Автоматически очищаем corrupted data
    SafeLocalStorage.remove(STORAGE_KEY)
  }
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    hasUnsavedAccounts: false, // Для управления состоянием кнопки добавления аккаунта
    accounts: []
  }),
  actions: {
    init() {
      const storage = SafeLocalStorage.get<Account[]>(STORAGE_KEY, getLocalStorageAccountsConfig)
      if (storage) {
        this.accounts = storage
      } else {
        SafeLocalStorage.set(STORAGE_KEY, [])
        this.accounts = []
      }
    },
    addAccount() {
      this.accounts.push({
        id: crypto.randomUUID(),
        login: '',
        password: '',
        type: ACCOUNT_TYPE.LOCAL,
        tags: []
      })
      this.hasUnsavedAccounts = true
    },
    saveAccount(index: number) {
      const savedAccounts = SafeLocalStorage.get<Account[]>(STORAGE_KEY, getLocalStorageAccountsConfig)

      if (savedAccounts) {
        savedAccounts[index] = this.accounts[index]
        SafeLocalStorage.set(STORAGE_KEY, savedAccounts)
      }

      this.hasUnsavedAccounts = false
    },
    deleteAccount(index: number) {
      if (this.accounts.length === index + 1 && this.hasUnsavedAccounts) {
        this.accounts.pop()
        this.hasUnsavedAccounts = false
        return
      }

      const savedAccounts = SafeLocalStorage.get<Account[]>(STORAGE_KEY)

      if (savedAccounts) {
        savedAccounts.splice(index, 1)
        SafeLocalStorage.set(STORAGE_KEY, savedAccounts)
      }

      this.accounts.splice(index, 1)
    }
  }
})

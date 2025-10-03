import { ACCOUNT_TYPE } from '../types'
import type { Account, AccountTag } from '../types'

class AccountValidationError extends Error {
  constructor(message: string, public field?: string, public value?: unknown) {
    super(message)
    this.name = 'AccountValidationError'
  }
}

const isAccountType = (value: unknown): value is ACCOUNT_TYPE => {
  const validTypes = ['local', 'LDAP'] as const
  return typeof value === 'string' && (validTypes as readonly string[]).includes(value)
}

const isAccountTag = (value: unknown): value is AccountTag => {
  return typeof value === 'object' && value !== null && 'text' in value && typeof (value as any).text === 'string'
}

export const isAccountStrict = (value: unknown): value is Account => {
  if (typeof value !== 'object' || value === null) {
    throw new AccountValidationError('Account must be an object', undefined, value)
  }

  const account = value as Record<string, unknown>

  // Детальная проверка каждого поля с ясными ошибками
  if (!('id' in account)) {
    throw new AccountValidationError('Account must have an id field', 'id')
  }
  if (typeof account.id !== 'string') {
    throw new AccountValidationError('Account id must be a string', 'id', account.id)
  }
  if (account.id.trim().length === 0) {
    throw new AccountValidationError('Account id cannot be empty', 'id', account.id)
  }

  if (!('login' in account)) {
    throw new AccountValidationError('Account must have a login field', 'login')
  }
  if (typeof account.login !== 'string') {
    throw new AccountValidationError('Account login must be a string', 'login', account.login)
  }
  if (account.login.trim().length === 0) {
    throw new AccountValidationError('Account login cannot be empty', 'login', account.login)
  }

  if (!('password' in account)) {
    throw new AccountValidationError('Account must have a password field', 'password')
  }
  if (account.password !== null && typeof account.password !== 'string') {
    throw new AccountValidationError('Account password must be null or string', 'password', account.password)
  }

  if (!('type' in account)) {
    throw new AccountValidationError('Account must have a type field', 'type')
  }
  if (!isAccountType(account.type)) {
    throw new AccountValidationError(
      `Account type must be ${ACCOUNT_TYPE.LOCAL} or ${ACCOUNT_TYPE.LDAP}`,
      'type',
      account.type
    )
  }

  if (!('tags' in account)) {
    throw new AccountValidationError('Account must have a tags field', 'tags')
  }
  if (!Array.isArray(account.tags)) {
    throw new AccountValidationError('Account tags must be an array', 'tags', account.tags)
  }

  // Проверка каждого тега
  for (let i = 0; i < account.tags.length; i++) {
    const tag = account.tags[i]
    if (!isAccountTag(tag)) {
      throw new AccountValidationError(`Account tag at index ${i} must have a text string field`, `tags[${i}]`, tag)
    }
  }

  return true
}

export const isAccountsArrayStrict = (value: unknown): value is Account[] => {
  if (!Array.isArray(value)) {
    throw new AccountValidationError('Accounts data must be an array')
  }

  for (let i = 0; i < value.length; i++) {
    try {
      if (!isAccountStrict(value[i])) {
        throw new AccountValidationError(`Invalid account at index ${i}`, `[${i}]`, value[i])
      }
    } catch (error) {
      if (error instanceof AccountValidationError) {
        // Добавляем информацию об индексе к ошибке
        throw new AccountValidationError(
          `Account validation failed at index ${i}: ${error.message}`,
          `[${i}].${error.field}`,
          error.value
        )
      }
      throw error
    }
  }

  return true
}

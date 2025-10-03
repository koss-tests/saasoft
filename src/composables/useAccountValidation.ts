import { reactive, computed } from 'vue'
import type { Account } from '../shared/types'
import { TAGS_MAX_TOTAL_LENGTH, LOGIN_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../constants/validation'

export const useAccountValidation = () => {
  const validationErrors = reactive<{
    tags: string[]
    login: string[]
    password: string[]
  }>({
    tags: [],
    login: [],
    password: []
  })

  const isAccountRecordValid = computed(
    () => !Object.values(validationErrors).some((errors: string[]) => errors.length > 0)
  )

  const validate = (accountRecord: Account) => {
    for (const key of Object.keys(validationErrors) as Array<keyof typeof validationErrors>) {
      validationErrors[key] = []
    }

    if (
      accountRecord.tags &&
      accountRecord.tags.reduce((totalLength: number, curr: { text: string }) => totalLength + curr.text.length, 0) >
        TAGS_MAX_TOTAL_LENGTH
    ) {
      validationErrors.tags = [`Теги не могут превышать более ${TAGS_MAX_TOTAL_LENGTH} символов в сумме`]
    }
    if (!accountRecord.login) {
      validationErrors.login = ['Логин обязателен']
    }
    if (accountRecord.login.length > LOGIN_MAX_LENGTH) {
      validationErrors.login = [`Длинна логина не должна превышать ${LOGIN_MAX_LENGTH} символов`]
    }
    if (accountRecord.type === 'local' && !accountRecord.password) {
      validationErrors.password = ['Пароль обязателен']
    }
    if (accountRecord.login.length > PASSWORD_MAX_LENGTH) {
      validationErrors.password = [`Длинна пароля не должна превышать ${PASSWORD_MAX_LENGTH} символов`]
    }

    return isAccountRecordValid.value
  }

  return {
    validationErrors,
    validate
  }
}

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, InputText, Select } from 'primevue'
import { InputTag } from './input-tag'
import { useAccountStore } from '../store'
import { useAccountValidation } from '../composables/useAccountValidation'
import type { Account, AccountTag, AccountTypeOption } from '../shared/types'
import { ACCOUNT_TYPE } from '../shared/types'

const accountStore = useAccountStore()

const { account, index } = defineProps<{
  index: number
  account: Account
}>()

const { validationErrors, validate } = useAccountValidation()

const accountRecordProxy = ref<Account>({ ...account })

const accountTypes = ref<AccountTypeOption[]>([
  { label: 'Локальный', value: ACCOUNT_TYPE.LOCAL },
  { label: 'LDAP', value: ACCOUNT_TYPE.LDAP }
])

const handleValidate = () => {
  const isValid = validate(accountRecordProxy.value)
  if (isValid) {
    accountStore.accounts[index] = accountRecordProxy.value
    accountStore.saveAccount(index)
  }
}

const onAccountTypeChange = ({ value }: { value: ACCOUNT_TYPE }) => {
  if (value === ACCOUNT_TYPE.LDAP) {
    accountRecordProxy.value.password = null
  } else {
    accountRecordProxy.value.password = account.password
  }
  handleValidate()
}

const accountTags = computed({
  get() {
    return accountRecordProxy.value.tags.map((tag: AccountTag) => tag.text)
  },
  set(value: string[]) {
    accountRecordProxy.value.tags = value.map((tag: string) => ({ text: tag }))
  }
})
</script>

<template>
  <div class="account-form-field">
    <div style="display: flex; gap: 1rem">
      <InputTag
        v-model="accountTags"
        placeholder="Метки"
        :invalid="!!validationErrors.tags.length"
        @change="handleValidate()"
      />
      <Select
        v-model="accountRecordProxy.type"
        :options="accountTypes"
        option-label="label"
        option-value="value"
        placeholder="Выберите тип аккаунта"
        @change="onAccountTypeChange"
        :pt="{
          root: {
            style: {
              height: '3rem'
            }
          },
          label: {
            style: {
              width: '10rem',
              textAlign: 'start'
            }
          }
        }"
      ></Select>
      <InputText
        v-model="accountRecordProxy.login"
        placeholder="Логин"
        :invalid="!!validationErrors.login.length"
        @blur="handleValidate"
        style="height: 3rem"
      />
      <InputText
        v-if="accountRecordProxy.type === 'local'"
        v-model="accountRecordProxy.password"
        type="password"
        placeholder="Пароль"
        :invalid="!!validationErrors.password.length"
        @blur="handleValidate"
        style="height: 3rem"
      />
      <div
        v-else
        style="width: 12rem"
      ></div>
      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        @click="accountStore.deleteAccount(index)"
        style="width: 3rem; height: 3rem"
      />
    </div>
  </div>
</template>

<style>
.p-inputtext {
  width: 12rem;
  max-width: 12rem;
}
</style>

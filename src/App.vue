<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { Button, Chip } from 'primevue'
import { AccountFormField } from './components'
import { useAccountStore } from './store'

const accountStore = useAccountStore()

onBeforeMount(() => {
  accountStore.init()
})
</script>

<template>
  <main>
    <div>
      <h2>Учетные записи</h2>
      <Button
        icon="pi pi-plus"
        size="small"
        :disabled="accountStore.hasUnsavedAccounts"
        style="margin-left: 1rem"
        @click="accountStore.addAccount"
      />
    </div>
    <Chip
      icon="pi pi-info-circle"
      severity="success"
      label="Для указания нескольких меток для одной пары логин/пароль используйте 'Пробел'"
      :pt="{
        root: {
          style: {
            background: 'var(--p-sky-400)'
          }
        }
      }"
    />
    <div class="accounts-form">
      <AccountFormField
        v-if="accountStore.accounts.length"
        v-for="(account, idx) of accountStore.accounts"
        :key="account.id"
        :index="idx"
        :account="account"
      />
      <div v-else>Нет аккаунтов</div>
    </div>
  </main>
</template>

<style scoped>
h2 {
  display: inline-block;
}
.accounts-form {
  margin: 2rem auto 0;
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

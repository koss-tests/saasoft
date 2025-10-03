<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { Tag } from 'primevue'

export declare type Nullable<T = void> = T | null | undefined

const values = defineModel({
  type: Array as PropType<Array<String>>,
  required: true
})

const { fluid, placeholder = 'Enter tags' } = defineProps<{
  defaultValue?: Nullable<string>
  placeholder?: string
  fluid?: boolean
  invalid?: boolean
}>()

const emit = defineEmits<{
  (e: 'change'): void
  (e: 'blur'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')

const addTag = () => {
  if (!inputValue.value) {
    return
  }
  values.value = [...values.value, inputValue.value]
  inputValue.value = ''
  emit('change')
}

const deleteTag = (indexOfTagToRemove: number) => {
  values.value = values.value.filter((_, idx) => idx !== indexOfTagToRemove)
  emit('change')
}

const onKeyPress = (e: KeyboardEvent) => {
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Tab') {
    e.preventDefault()
    addTag()
  }
}

const onBlur = (e: Event) => {
  if ((e.target as HTMLInputElement).value) {
    addTag()
  }
  emit('blur')
}

const focusInput = () => {
  inputRef.value?.focus()
}
</script>

<template>
  <div
    class="input-tag"
    :class="{ fluid, invalid }"
    @click.self="focusInput"
  >
    <Tag
      v-for="(value, idx) of values"
      :key="idx"
      style="margin: 0.25rem"
    >
      <span>{{ value }}</span>
      <span class="input-tag__icon-wrapper"
        ><i
          class="pi pi-times input-tag__delete-icon"
          @click="deleteTag(idx)"
        ></i
      ></span>
    </Tag>
    <input
      ref="inputRef"
      v-model="inputValue"
      @keypress="onKeyPress"
      :placeholder="placeholder"
      class="input-tag__input"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.input-tag {
  width: 16rem;
  max-width: 16rem;
  min-height: 3rem;
  display: flex;
  flex-flow: wrap;
  font-family: inherit;
  font-feature-settings: inherit;
  font-size: 1rem;
  color: var(--p-inputtext-color);
  background: var(--p-inputtext-background);
  padding-block: var(--p-inputtext-padding-y);
  padding-inline: var(--p-inputtext-padding-x);
  border: 1px solid var(--p-inputtext-border-color);
  transition: background var(--p-inputtext-transition-duration), color var(--p-inputtext-transition-duration),
    border-color var(--p-inputtext-transition-duration), outline-color var(--p-inputtext-transition-duration),
    box-shadow var(--p-inputtext-transition-duration);
  appearance: none;
  border-radius: var(--p-inputtext-border-radius);
  outline-color: transparent;
  box-shadow: var(--p-inputtext-shadow);
}
.input-tag.fluid {
  width: 100% !important;
}
.input-tag.invalid {
  border-color: var(--p-inputtext-invalid-border-color);
}
.input-tag.invalid .input-tag__input::placeholder {
  color: var(--p-inputtext-invalid-placeholder-color);
}
.input-tag__input {
  font-size: 1rem;
  margin-top: 0.25rem;
  border: none;
  background: transparent;
  display: inline-flex;
  outline: none;
}
.input-tag__input::placeholder {
  color: var(--p-form-field-placeholder-color);
}
.input-tag__icon-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.input-tag__delete-icon {
  margin-top: 0.125rem;
  font-size: 0.75rem;
}
</style>

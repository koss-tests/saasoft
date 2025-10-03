import { TypeValidationError } from '../helpers'

export class AccountValidationError extends Error {
  constructor(message: string, public field?: string, public value?: unknown) {
    super(message)
    this.name = 'AccountValidationError'
  }
}

// Типы для поддерживаемых значений
type Serializable = string | number | boolean | null | undefined | object | Array<Serializable>

// Конфигурация
interface StorageConfig<T> {
  defaultValue?: T
  validator?: (value: unknown) => value is T
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
  onError?: (error: Error, operation: string, key?: string) => void
  // Новая опция - строгая валидация типа
  strict?: boolean
}

// Дефолтная обработка ошибок
const defaultErrorHandler = (error: Error, operation: string, key?: string) => {
  console.error(`Storage ${operation} failed for key "${key}":`, error.message)
}

export class SafeLocalStorage {
  private static config: StorageConfig<any> = {}

  /**
   * Глобальная конфигурация
   */
  static configure(config: StorageConfig<any>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Создает валидатор типа на основе TypeScript guard
   */
  // private static createTypeValidator<T>(): (value: unknown) => value is T {
  //   // Это базовый валидатор, который можно переопределить через config
  //   return (value: unknown): value is T => {
  //     // По умолчанию принимаем любой валидированный JSON
  //     return value !== undefined
  //   }
  // }

  /**
   * Выполняет строгую валидацию типа
   */
  private static performStrictValidation<T>(value: unknown, key: string, config: StorageConfig<T>): T {
    // Если есть кастомный валидатор - используем его
    if (config.validator) {
      if (!config.validator(value)) {
        throw new TypeValidationError(`valid ${key} data`, value)
      }
      return value
    }

    // Базовые проверки для примитивов
    if (config.defaultValue !== undefined) {
      const expectedType = typeof config.defaultValue
      if (expectedType !== 'undefined' && typeof value !== expectedType) {
        throw new TypeValidationError(expectedType, value)
      }
    }

    return value as T
  }

  /**
   * Безопасно получает значение из localStorage со строгой типизацией
   */
  static get<T = Serializable>(key: string, config: StorageConfig<T> = {}): T | null {
    const mergedConfig = { ...this.config, ...config, strict: true }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available')
      }

      const item = window.localStorage.getItem(key)

      if (item === null) {
        if ('defaultValue' in mergedConfig) {
          return mergedConfig.defaultValue!
        }
        return null
      }

      // Используем кастомный десериализатор или JSON.parse
      const deserialized = mergedConfig.deserializer ? mergedConfig.deserializer(item) : JSON.parse(item)

      // СТРОГАЯ ВАЛИДАЦИЯ ТИПА
      const validatedValue = this.performStrictValidation<T>(deserialized, key, mergedConfig)

      return validatedValue
    } catch (error) {
      const handler = mergedConfig.onError || defaultErrorHandler
      const operation = `get("${key}")`
      handler(error instanceof Error ? error : new Error('Unknown error'), operation, key)

      // Возвращаем defaultValue при ошибке, если он указан
      if ('defaultValue' in mergedConfig) {
        return mergedConfig.defaultValue!
      }

      // Если включен strict mode и нет defaultValue - выбрасываем ошибку
      if (mergedConfig.strict) {
        throw error
      }

      return null
    }
  }

  /**
   * Безопасно сохраняет значение в localStorage
   */
  static set<T>(key: string, value: T, config: StorageConfig<T> = {}): void {
    const mergedConfig = { ...this.config, ...config }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available')
      }

      // Валидация перед сохранением
      if (mergedConfig.validator && !mergedConfig.validator(value)) {
        throw new Error('Value failed validation')
      }

      // Используем кастомный сериализатор или JSON.stringify
      const serialized = mergedConfig.serializer ? mergedConfig.serializer(value) : JSON.stringify(value)

      window.localStorage.setItem(key, serialized)
    } catch (error) {
      const handler = mergedConfig.onError || defaultErrorHandler
      const operation = `set("${key}")`
      handler(error instanceof Error ? error : new Error('Unknown error'), operation, key)

      if (mergedConfig.strict) {
        throw error
      }
    }
  }

  // remove, has, clear, keys методы остаются без изменений
  static remove(key: string, config: StorageConfig<any> = {}): void {
    const mergedConfig = { ...this.config, ...config }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available')
      }

      window.localStorage.removeItem(key)
    } catch (error) {
      const handler = mergedConfig.onError || defaultErrorHandler
      const operation = `remove("${key}")`
      handler(error instanceof Error ? error : new Error('Unknown error'), operation, key)

      if (mergedConfig.strict) {
        throw error
      }
    }
  }

  static has(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }
      return window.localStorage.getItem(key) !== null
    } catch {
      return false
    }
  }

  static clear(config: StorageConfig<any> = {}): void {
    const mergedConfig = { ...this.config, ...config }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available')
      }

      window.localStorage.clear()
    } catch (error) {
      const handler = mergedConfig.onError || defaultErrorHandler
      const operation = 'clear()'
      handler(error instanceof Error ? error : new Error('Unknown error'), operation)

      if (mergedConfig.strict) {
        throw error
      }
    }
  }

  static keys(): string[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return []
      }
      return Object.keys(window.localStorage)
    } catch {
      return []
    }
  }
}

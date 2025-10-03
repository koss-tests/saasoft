import { TypeValidationError } from '../helpers'

// Валидаторы для строгой типизации
export const Validators = {
  string: (value: unknown): value is string => {
    if (typeof value !== 'string') {
      throw new TypeValidationError('string', value)
    }
    return true
  },

  number: (value: unknown): value is number => {
    if (typeof value !== 'number') {
      throw new TypeValidationError('number', value)
    }
    return true
  },

  boolean: (value: unknown): value is boolean => {
    if (typeof value !== 'boolean') {
      throw new TypeValidationError('boolean', value)
    }
    return true
  },

  array: <T>(itemValidator?: (item: unknown) => item is T) => {
    return (value: unknown): value is T[] => {
      if (!Array.isArray(value)) {
        throw new TypeValidationError('array', value)
      }

      if (itemValidator) {
        value.forEach((item, index) => {
          if (!itemValidator(item)) {
            throw new TypeValidationError(`array of specific type at index ${index}`, item)
          }
        })
      }

      return true
    }
  },

  object: (shape?: Record<string, (value: unknown) => boolean>) => {
    return (value: unknown): value is object => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new TypeValidationError('object', value)
      }

      if (shape) {
        Object.entries(shape).forEach(([key, validator]) => {
          if (!(key in value)) {
            throw new Error(`Missing required property: ${key}`)
          }
          if (!validator((value as any)[key])) {
            throw new TypeValidationError(`valid type for property ${key}`, (value as any)[key])
          }
        })
      }

      return true
    }
  }
}

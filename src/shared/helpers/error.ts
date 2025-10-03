// Утилиты для валидации типов
export class TypeValidationError extends Error {
  constructor(expected: string, actual: unknown) {
    const actualType = Array.isArray(actual) ? 'array' : typeof actual
    const actualValue = JSON.stringify(actual).slice(0, 100)
    super(`Expected ${expected}, but got ${actualType}: ${actualValue}`)
    this.name = 'TypeValidationError'
  }
}

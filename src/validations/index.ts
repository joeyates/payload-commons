import type { NumberFieldSingleValidation } from 'payload'

type NumberRangeValidationFactory = (min: number, max: number) => NumberFieldSingleValidation

const numberRangeValidation: NumberRangeValidationFactory = (min, max) => {
  return value => {
    if (!value) {
      return "This field is required"
    }
    const valid = value >= min && value <= max
    if (!valid) {
      return `This field must be between ${min} and ${max}`
    }
    return true
  }
}

export { numberRangeValidation }

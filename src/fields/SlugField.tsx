'use client'

import React, { ChangeEvent, useEffect, useState } from 'react'
import { formatLabels } from 'payload/shared'
import { FieldError, TextInput, type TextInputProps, useField, useFormFields } from '@payloadcms/ui'

const slugify = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\-a-z0-9]/g, " ")
    .trim()
    .replace(/\s+/g, "-")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEmpty = (value: any) => value === null || value === undefined

const isBlank = (value: string | null | undefined) => isEmpty(value) || value === ''

interface ToLabelArgs {
  path: string,
  source: string,
  managed: boolean
}

const toLabel = ({ path, source, managed }: ToLabelArgs) => {
  const { singular } = formatLabels(path)
  if (managed) {
    const sourceLabel = formatLabels(source).singular
    return `${singular} (generated from '${sourceLabel}' field)`
  } else {
    return singular
  }
}

const validateSlug = (value: string | null) => {
  if (isBlank(value)) {
    return true
  }
  const slug = slugify(value as string)
  if (slug !== value) {
    return 'Slug must be lowercase, and can only contain letters, numbers and dashes'
  }
  return true
}

// `field` has been deprecated from the TextInputProps type, but it is the only
// way to get the `required` flag.
type DeprecatedFieldEntry = { required: boolean }
// The TextInputProps type has dual handling of onChange based on the value of hasMany
// If we accept both values, we are forced to have two rendering paths.
type SlugFieldInputProps = TextInputProps & { hasMany: false, source: string, field: DeprecatedFieldEntry }

const SlugField = (props: SlugFieldInputProps) => {
  const { path, source, field: { required } } = props
  const field = useField<string>({ path, validate: validateSlug })
  const { setValue, value, errorMessage } = field
  const showError = !!errorMessage
  const sourceField = useFormFields(([fields]) => (fields && fields[source]))
  const sourceValue = sourceField.value as string
  const slugifiedSourceValue = slugify(sourceValue || "")
  // We only set the slug if the user has not set it, or if the slugified
  // source value matches the current value.
  const startManaged = isBlank(value) || slugifiedSourceValue === value
  const [managed, setManaged] = useState(startManaged)
  const label = toLabel({ path, source, managed })

  useEffect(() => {
    if (!managed) {
      return
    }

    if (isBlank(sourceValue)) {
      return
    }

    const slug = slugify(sourceValue)
    setValue(slug)
  }, [
    managed,
    setValue,
    sourceValue,
    value
  ])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setManaged(isBlank(value))
    setValue(value)
  }
  const { field: _field, source: _source, ...noSource } = props

  const error = showError ? <FieldError message={errorMessage} path={path} showError={true} /> : undefined

  return (
    <TextInput
      {...noSource}
      label={label}
      onChange={handleChange}
      path={path}
      required={required}
      Error={error}
      showError={showError}
      value={value}
    />
  )
}

export default SlugField

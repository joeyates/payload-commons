import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from './app/src/payload.config'

type Credentials = {
  email: string
  password: string
  roles: string[]
}

const userExists = async (credentials: Credentials) => {
  const payload = await getPayload({ config })

  const user = await payload.find({
    collection: 'users',
    where: {
      email: { equals: credentials.email }
    },
    limit: 1,
  })

  return user.docs.length > 0
}

const ensureUser = async (credentials: Credentials) => {
  if (await userExists(credentials)) {
    return true
  }
  const payload = await getPayload({ config })

  await payload.create({
    collection: 'users',
    data: credentials,
    depth: 0,
    overrideAccess: true,
  })

  return true
}

const logIn = async (page: Page, credentials: Credentials) => {
  await page.goto('/admin')

  await page.fill('#field-email', credentials.email)
  await page.fill('#field-password', credentials.password)

  const loginButton = page.locator('text=Login')
  await loginButton.click()
  await expect(page.getByRole('heading', { name: 'Collections' })).toBeVisible()
}

export { Credentials, ensureUser, logIn }

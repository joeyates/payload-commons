import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { ensureUser, logIn, type Credentials } from './support/authentication'

const { beforeAll, describe } = test

const admin: Credentials = {
  email: 'admin@example.com',
  password: 'test',
  roles: ['admin']
}

const appBase = 'http://localhost:3000'

describe('Login', () => {
  let page: Page

  beforeAll(async ({ browser }) => {
    await ensureUser(admin)
    const context = await browser.newContext()
    page = await context.newPage()
    await logIn(page, admin)
  })

  test('should log user in', async () => {
    await page.goto('/admin/account')
    await expect(page.locator(`h1[title="${admin.email}"]`)).toBeVisible()
  })
})

import React from 'react'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
// import type { Payload } from 'payload'
import { buildConfig } from 'payload'
import { createPayloadRequest, getPayload } from 'payload'
import SlugField from '@/fields/SlugField'
import { ConfigProvider, DocumentFields, EditView, Form, ServerFunctionsProvider, UploadHandlersProvider } from '@payloadcms/ui'

const Post = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        components: {
          Field: {
            path: '.#SlugField',
            clientProps: {
              source: 'title'
            }
          }
        }
      },
      required: true
    }
  ]
}

const config = await buildConfig({
  collections: [Post]
})

// From https://github.com/vercel/next.js/discussions/48937#discussioncomment-6395245
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime.js'

const AppRouterContextProviderMock = ({ router, children }) => {
  const mockedRouter = {
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    ...router,
  }
  return (
    <AppRouterContext.Provider value={mockedRouter}>
      {children}
    </AppRouterContext.Provider>
  )
}

/*
let payload //: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})
*/

test('returns HTML', () => {
  const field = (
    <ConfigProvider config={config}>
      <AppRouterContextProviderMock router={{}}>
        <ServerFunctionsProvider serverFunction={ vi.fn() }>
          <UploadHandlersProvider>
            <Form
              action="/posts/1"
              isDocumentForm={true}
              method="POST"
            >
              <DocumentFields
                BeforeFields={[]}
                docPermissions={[]}
                fields={config.fields}
                schemaPathSegments={[]}
              />
              <input name="title" />
              <SlugField path="posts.slug" source="title" field={{ required: true }} />
            </Form>
          </UploadHandlersProvider>
        </ServerFunctionsProvider>
     </AppRouterContextProviderMock>
    </ConfigProvider>
  )
  const foo = render(field)
})

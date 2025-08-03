import type { CollectionConfig } from 'payload'

export const Post: CollectionConfig = {
  slug: 'posts',
  access: {
    read: ({ req: { user } }) => {
      return Boolean(user)
    }
  },
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
            path: '../../../..#SlugField',
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


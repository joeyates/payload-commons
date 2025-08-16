'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'
import { Pagination } from '@payloadcms/ui/elements/Pagination'
import { ClickableArrow } from '@payloadcms/ui/elements/Pagination/ClickableArrow'
import graphqlFetch from '../utils/graphqlFetch'

/*
This component renders previous and next buttons for navigating through items.

It fetches the previous and next items based on the current item's ID and the provided GraphQL query.

It uses the `useAuth` hook to get the user's API key for making GraphQL requests.
This means that the user bust have an API key available.

Parameters:

- `prefix`: The URL prefix for the items (e.g., '/items/'), so
  that `${prefix}${id}` gives the full URL for the item.
- `query`: The GraphQL query to fetch the previous and next items. It must
  include the `Next` and `Previous` aliases to get the neighbouring items,
  it should fetch the `id` of the items
  and it should accept an `id` variable to specify the current item's ID.

Example usage:

```jsx
import PreviousNextButtons from './PreviousNextButtons';

const prefix = '/admin/collections/posts/'

const query = `
query previousNextQuery($id: Int) {
  Previous: Posts(where: {id: {less_than: $id}}, limit: 1, sort: "-id") {
    docs { id }
  }

  Next: Posts(where: {id: {greater_than: $id}}, limit: 1, sort: "id") {
    docs { id }
  }
}
`

return (
  <PreviousNextButtons prefix={prefix} query={query} />
)
```

*/

interface PreviousNextButtonsProps {
  prefix: string
  query: string
}

const PreviousNextButtons = ({ prefix, query }: PreviousNextButtonsProps) => {
  const [previousItem, setPreviousItem] = useState<number | null>(null)
  const [nextItem, setNextItem] = useState<number | null>(null)
  const [id, setId] = useState<number | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    const idText = pathname.replace(prefix, '')
    if (idText.match(/^\d+$/)) {
      const parsedId = parseInt(idText, 10)
      setId(parsedId)
    } else {
      setId(null)
    }
  }, [pathname, prefix])

  useEffect(() => {
    if (user && user.apiKey) {
      setApiKey(user.apiKey)
    }
  }, [user])

  useEffect(() => {
    if (id === null || apiKey === null) {
      return
    }

    graphqlFetch({ query, apiKey, variables: { id } }).then(({ data }) => {
      const next = data.Next.docs[0]?.id
      const previous = data.Previous.docs[0]?.id
      if (next) {
        setNextItem(next)
      }
      if (previous) {
        setPreviousItem(previous)
      }
    }).catch(error => {
      console.error('Error fetching neighbouring items:', error)
    })
  }, [id, apiKey, query])

  if (apiKey === null) {
    return null
  }

  if (id === null) {
    return null
  }

  const handleChange = (page: number) => {
    const path = `${prefix}${page}`
    router.push(path)
  }

  const hasPreviousPage = previousItem !== null
  const hasNextPage = nextItem !== null

  if (!hasPreviousPage && !hasNextPage) {
    // Pagination renders `null` when there are no previous or next posts
    // Render a disabled version of the Pagination component
    return (
      <div className="previous-next-pagination">
        <div className="paginator">
          <ClickableArrow direction='left' isDisabled={true} />
          <ClickableArrow direction='right' isDisabled={true} />
        </div>
      </div>
    )
  }
  const previousPage = previousItem ? previousItem : undefined
  const nextPage = nextItem ? nextItem : undefined

  return (
    <div className="previous-next-pagination">
      <Pagination hasPrevPage={hasPreviousPage} prevPage={previousPage} hasNextPage={hasNextPage} nextPage={nextPage} onChange={handleChange} />
    </div>
  )
}

export default PreviousNextButtons

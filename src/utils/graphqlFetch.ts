interface GraphQLFetchParams {
  query: string
  apiKey: string
  variables?: Record<string, string | number>
}

const graphqlFetch = async ({ query, apiKey, variables }: GraphQLFetchParams) => {
  const body = { query, variables }

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const data = await response.json()
  return data
} 

export default graphqlFetch

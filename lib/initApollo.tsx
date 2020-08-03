import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import fetch from 'isomorphic-unfetch'
import { isBrowser } from './isBrowser'

let apolloClient: ApolloClient<import("apollo-boost").NormalizedCacheObject> | null = null; 

interface Options {
  getToken: () => string 
}

// Polyfill fetch() on the server ( used by the apollo client) 
if(!isBrowser){
  (global as any).fetch = fetch 
}

function create (initialState: any, { getToken }: Options) {
  const httpLink = createHttpLink({
    uri: 'https://api.graph.cool/simple/v1/cj5geu3slxl7t0127y8sity9r', 
    credentials: 'same-origin'
  })
  const authLink = setContext((_, { headers }) => {
    const token = getToken() 
    return {
      headers: {
        ...headers, 
        authorization: token ? `Bearer ${token}`, 
      }, 
    }
  })

  return new ApolloClient({
    connectToDevTools: isBrowser, 
    ssrMode: !isBrowser, 
    link: authLink.concat(httpLink), 
    cache: new InMemoryCache().restore(initialState || {})
  })
}

export default function initAppollo (initialState: any, options: Options) {
  // make sure to create a new client for every server-side request so that data 
  // isn't shared between connections 
  if (!isBrowser){
    return create(initialState, options) 
  }

  // reuse client on the client-side 
  if(!apolloClient) {
    apolloClient = create(initialState, options)
  }

  return apolloClient
}
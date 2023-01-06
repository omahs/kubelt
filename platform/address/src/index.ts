import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'
// import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/next'
import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import CryptoAddress from './nodes/crypto'
import ContractAddress from './nodes/contract'
import OAuthAddress from './nodes/oauth'
import type { Environment } from './types'

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      onError({ error, type, path, input, ctx, req }) {
        console.error('Error:', error)
        // TODO: report somehwere
      },
      createContext: (opts) =>
        createContext(opts as FetchCreateContextFnOptions, env),
    })
  },
}
//FetchCreateContextFnOptions
export { CryptoAddress, ContractAddress, OAuthAddress }

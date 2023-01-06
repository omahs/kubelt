// @kubelt/platform.edges:/src/index.ts

/**
 * This Cloudflare worker is for experimenting with the graph "edges"
 * database.
 *
 * @packageDocumentation
 */
import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'
import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
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

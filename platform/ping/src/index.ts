// platform/ping:src/index.ts
/**
 * This Cloudflare worker provides an example OpenRPC ping service.
 *
 * @packageDocumentation
 */

// Worker
// -----------------------------------------------------------------------------

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import type { Environment } from './types'
import ReplyMessage from './nodes/replyMessage'

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
        createContext(opts as CreateNextContextOptions, env),
    })
  },
}
export { ReplyMessage }

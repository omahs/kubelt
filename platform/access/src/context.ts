import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

import createStarbaseClient, {
  StarbaseApi,
} from '@kubelt/platform-clients/starbase'
import { BaseContext } from '@kubelt/types'
import type { inferAsyncReturnType } from '@trpc/server'

import { Access, Authorization } from '.'
import type { Environment } from './types'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions & BaseContext> {
  Access: DurableObjectNamespace
  access?: Access
  Authorization: DurableObjectNamespace
  authorization?: Authorization
  Starbase: Fetcher
  starbaseClient?: StarbaseApi
}
/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createSSGHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContextInner(opts: CreateInnerContextOptions) {
  const starbaseClient = createStarbaseClient(opts.Starbase)
  return {
    starbaseClient,
    ...opts,
  }
}
/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(
  opts: FetchCreateContextFnOptions,
  env: Environment
) {
  const contextInner = await createContextInner({ ...opts, ...env })
  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    ...contextInner,
  }
}

// For more docs on this, see https://trpc.io/docs/context
export type Context = inferAsyncReturnType<typeof createContextInner>

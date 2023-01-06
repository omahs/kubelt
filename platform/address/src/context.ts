import { BaseContext } from '@kubelt/types'
import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { DurableObjectStubProxy } from 'do-proxy'
import { OAuthAddress, CryptoAddress } from '.'
import type { Environment, NodeType, AddressType } from './types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { AddressURN } from '@kubelt/urns/address'
import { ENSRes } from '@kubelt/platform-clients/ens-utils'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<CreateNextContextOptions & BaseContext> {
  TOKEN_NFTAR: string
  NFTAR_CHAIN_ID: string
  NFTAR_URL: string
  CryptoAddress: DurableObjectNamespace
  OAuthAddress: DurableObjectNamespace
  ContractAddress: DurableObjectNamespace
  Edges: Fetcher
  Access: Fetcher
  address?: DurableObjectStubProxy<CryptoAddress | OAuthAddress>
  addressURN?: AddressURN
  nodeType?: NodeType
  addrType?: AddressType
  addressDescription?: ENSRes
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
  const edges = createEdgesClient(opts.Edges)
  return {
    ...opts,
    edges,
  }
}
/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(
  opts: CreateNextContextOptions,
  env: Environment
) {
  const contextInner = await createContextInner({ ...opts, ...env })
  return {
    req: opts.req,
    res: opts.res,
    ...contextInner,
  }
}

// For more docs on this, see https://trpc.io/docs/context
export type Context = inferAsyncReturnType<typeof createContextInner>

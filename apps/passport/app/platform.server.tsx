import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { CryptoWorkerApi } from '@kubelt/platform.address/src/types'
import type { WorkerApi as AccessApi } from '@kubelt/platform.access/src/types'
import type { Func, JsonRpcClient } from 'typed-json-rpc'
import type { ScopeMeta } from './components/authorization/Authorization'
import { GraphQLClient } from 'graphql-request'
import { getSdk } from '~/galaxy.server'

interface StarbaseApi {
  [key: string]: Func
  kb_initPlatform(): Promise<string[]>
  kb_appScopes(): Promise<Record<string, ScopeMeta>>
  kbt_appProfile(): Promise<Record<string, any>>
}

export function getStabaseClient() {
  return createFetcherJsonRpcClient<StarbaseApi>(Starbase)
}

export function getAccessClient() {
  return createFetcherJsonRpcClient<AccessApi>(Access)
}

export function getAddressClient(addressUrn: string) {
  const requestInit: RequestInit = {
    headers: {
      'X-3RN': addressUrn,
    },
  }
  return createFetcherJsonRpcClient<CryptoWorkerApi>(Address, requestInit)
}
export function getAddressClientFromURN(addressUrn: string) {
  const requestInit: RequestInit = {
    headers: {
      'X-3RN': addressUrn,
    },
  }
  return createFetcherJsonRpcClient<CryptoWorkerApi>(Address, requestInit)
}

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}

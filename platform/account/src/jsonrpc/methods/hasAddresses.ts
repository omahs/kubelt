import * as set from 'ts-set-utils'
import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { AddressURNSpace } from '@kubelt/urns/address'

import type { AddressList } from '../middlewares/addressList'
import { Edge, EdgeDirection } from '@kubelt/graph'
import type { AccountURN } from '@kubelt/urns/account'
import { EDGE_ADDRESS } from '@kubelt/graph/edges'

// Should this live in @kubelt/platform-middlewares/inputValidators?
export const AddressListInput = z.custom<AddressList>((input) => {
  if (!Array.isArray(input)) {
    throw new Error('address list must be an array')
  }
  input.forEach((address) => {
    if (!AddressURNSpace.is(address)) {
      throw new Error(`invalid address provided: ${address}`)
    }
  })
  return input as AddressList
})

export type HasAddressesParams = {
  account: AccountURN
  addresses: AddressList
}

export const HasAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  addresses: AddressListInput,
})

export const hasAddressesMethod = async ({
  input,
  ctx,
}: {
  input: HasAddressesParams
  ctx: Context
}) => {
  // Return the list of edges between the account node and any address
  // nodes. Don't filter the addresses by type, we want them all (the
  // total number is normally going to be small).
  const query = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    id: input.account,
    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,
    // Account -> Address edges indicate ownership.
    dir: EdgeDirection.Outgoing,
  }
  const edgesResult = await ctx.edges.getEdges.query({ query })
  const edgeList = edgesResult.edges

  // A set of the addresses owned by the account.
  const owned = new Set(
    edgeList.map((edge: Edge) => {
      return edge.dst.urn
    })
  )
  // The input set of addresses to check.
  const addresses = new Set(input.addresses)

  // Determine if set B is a subset of set A. A set B is a subset of A
  // if all elements of B are in set
  return set.subset(owned, addresses)
}

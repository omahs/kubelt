import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { AddressURN } from '@kubelt/urns/address'

import { Edge, EdgeDirection } from '@kubelt/graph'
import { EDGE_ADDRESS } from '@kubelt/graph/edges'

import type { AddressList } from '../middlewares/addressList'

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  type: inputValidators.CryptoAddressTypeInput.optional(),
})

export type GetAddressesParams = z.infer<typeof GetAddressesInput>

export const getAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<AddressList> => {
  const query = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    id: input.account,
    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,
    // Account -> Address edges indicate ownership.
    dir: EdgeDirection.Outgoing,

    dst: {
      // Only keep edges having the given node type. The node type is
      // specified as an r-component in node URNs.
      rc: {
        addr_type: input.type,
      },
    },
  }
  // Return the list of edges between the account node and any address
  // nodes, filtered by address type if provided.
  // const edgeResult = await listAddresses(ctx.Edges, input.account, input?.type)
  const edgesResult = await ctx.edges.getEdges.query({ query })

  // The source nodes in the returned edges are the URNs of the
  // account nodes.
  const addresses = edgesResult.edges.map((edge: Edge) => {
    return edge.dst.urn as AddressURN
  })

  return addresses
}

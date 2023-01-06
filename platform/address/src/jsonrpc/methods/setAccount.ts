import { z } from 'zod'
import { AccountURN } from '@kubelt/urns/account'
import { Context } from '../../context'
import createEdgesClient from '@kubelt/platform-clients/edges'

import type { AddressURN } from '@kubelt/urns/address'
import { AccountURNSpace } from '@kubelt/urns/account'

import { EDGE_ADDRESS } from '@kubelt/graph/edges'
import {
  AccountURNInput,
  AddressURNInput,
} from '@kubelt/platform-middleware/inputValidators'

export const SetAccountInput = AccountURNInput
export const SetAccountOutput = z.object({
  set: z.object({
    account: AccountURNInput,
    address: AddressURNInput,
  }),
})

type SetAccountParams = z.infer<typeof SetAccountInput>
type SetAccountResult = z.infer<typeof SetAccountOutput>

export const setAccountMethod = async ({
  input,
  ctx,
}: {
  input: SetAccountParams
  ctx: Context
}): Promise<SetAccountResult> => {
  const edges = ctx.Edges
  const nodeClient = ctx.address

  // When the X-3RN header is parsed, the r-components contain details
  // of the type of address.
  const addrType = ctx.addrType
  const nodeType = ctx.nodeType
  const rComponents = `addr_type=${addrType}&node_type=${nodeType}`

  // This is the core part of the address, e.g. an Ethereum wallet
  // address, an e-mail address, etc. It's taken from the X-3RN header
  // included in the request.
  // Convert to a base URN with no components.
  const address = ctx.addressURN
  // This address used to link the account node to the address node must
  // have the node_type and addr_type URN r-components included so they
  // can be stored in the database for later querying.
  const fullAddress = `${address}?+${rComponents}` as AddressURN

  const account = input
  if (!AccountURNSpace.is(account)) {
    throw new Error('Invalid account URN')
  }

  // Store the owning account for the address node in the node itself.
  await nodeClient?.class.setAccount(account)

  const edgesClient = createEdgesClient(edges)
  const linkResult = await edgesClient.makeEdge.mutate({
    src: account,
    dst: fullAddress,
    tag: EDGE_ADDRESS,
  })

  // TODO how about a nice predicate fn to distinguish these error
  // results?

  const edge = linkResult.edge
  return {
    set: {
      account: edge.src as AccountURN,
      address: edge.dst as AddressURN,
    },
  }
}

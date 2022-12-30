// @kubelt/platform.access:src/jsonrpc/methods/revokeSession.ts

import { z } from 'zod'

import { AccessURNSpace } from '@kubelt/urns/access'
import { unlinkAccountAddress } from '@kubelt/graph/util'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { AccessURNInput } from '../middleware/validators'

export const RevokeSessionMethodInput = AccessURNInput

export const RevokeSessionMethodOutput = z.boolean()

export type RevokeSessionParams = z.infer<typeof RevokeSessionMethodInput>

export const revokeSessionMethod = async ({
  input,
  ctx,
}: {
  input: RevokeSessionParams,
  ctx: Context,
}) => {
  // The ValidateJWT middleware extracts the account URN from the JWT
  // and places it on the context.
  const account = ctx.accountURN
  const access = input

  const name = AccessURNSpace.decode(input)
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  // Create the session object state; we don't control when it's garbage
  // collected.
  await accessNode.class.revoke()

  // Delete the edge linking an account node to an access (session)
  // node.
  await unlinkAccountAddress(ctx.Edges, account, access)

  return true
}

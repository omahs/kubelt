import { z } from 'zod'
import { listSessions } from '@kubelt/graph/util'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'

import type { Edge } from '@kubelt/graph'
import type { AccessURN } from '@kubelt/urns/access'

import { AccessURNSpace } from '@kubelt/urns/access'

// Input
// -----------------------------------------------------------------------------

export const GetSessionsMethodInput = z.object({
})

export type GetSessionsParams = z.infer<typeof GetSessionsMethodInput>

// Output
// -----------------------------------------------------------------------------

// Consider moving to inputValidators if potentially reusable.
export const accessValidator = z.custom<AccessURN>((input) => {
  if (typeof input !== 'string') {
    throw new Error(`input is not a string: ${input}`)
  }
  if (!AccessURNSpace.is(input)) {
    throw new Error(`invalid access URN: ${input}`)
  }
  return input as AccessURN
})

export const GetSessionsMethodOutput = z.array(accessValidator)

// Method
// -----------------------------------------------------------------------------

export const getSessionsMethod = async ({
  input,
  ctx,
}: {
  input: GetSessionsParams
  ctx: Context
}) => {
  // Returns a list of Access node URNs.
  const sessions = await listSessions(ctx.Edges, ctx.accountURN)

  return sessions
}

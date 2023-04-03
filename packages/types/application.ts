import { z } from 'zod'

//TODO: Will have to revise and integrated with Scope in next iteration
export const ClaimName = z.union([z.literal('email'), z.literal('openid')])
export type ClaimName = z.infer<typeof ClaimName>

export const ClaimValue = z.any()
export type ClaimValue = z.infer<typeof ClaimValue>

export type ScopeMeta = {
  name: ClaimName
  description: string
  class: string
}

export const PersonaData = z.record(ClaimName, ClaimValue)
export type PersonaData = z.infer<typeof PersonaData>

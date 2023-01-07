import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { z } from 'zod'

export interface Environment {
  ApplicationDONamespace: DurableObjectNamespace
  Edges: Fetcher
}

export type AppCreateResult = z.infer<typeof AppCreateResultSchema>

export const AccountURNSchema = z.custom<AccountURN>((input) => {
  if (AccountURNSpace.parse(input as AccountURN) === null) {
    throw new Error('Invalid AccountURN')
  }
  return input as AccountURN
})

export const AppCreateResultSchema = z.object({
  account: AccountURNSchema,
  clientId: z.string(),
  clientName: z.string()
})

export type AppUpdateRequestParams = z.infer<typeof AppUpdateRequestParamsSchema>

export const AppUpdateRequestParamsSchema = z.object({
  clientId: z.string(),
  updates: z.object({
    name: z.string(),
    icon: z.string().optional(),
    redirectURI: z.string().optional(),
    termsURL: z.string().optional(),
    websiteURL: z.string().optional(),
    mirrorURL: z.string().optional(),
    discordUser: z.string().optional(),
    mediumUser: z.string().optional(),
    twitterUser: z.string().optional()
  })
})

export const AppObjectSchema = z.object({
  name: z.string(),
  icon: z.string().optional(),
  redirectURI: z.string().optional(),
  termsURL: z.string().optional(),
  websiteURL: z.string().optional(),
  mirrorURL: z.string().optional(),
  discordUser: z.string().optional(),
  mediumUser: z.string().optional(),
  twitterUser: z.string().optional()
})

export type AppObject = z.infer<typeof AppObjectSchema>

export const AppUpdateableFieldsSchema = z.object({
  clientName: z.string(),
  published: z.boolean(),
  app: AppObjectSchema
})

export const AppReadableFieldsSchema = z.object({
  clientId: z.string(),
  secretTimestamp: z.date(),
  apiKeyTimestamp: z.date()
})

export const AppInternalFieldSchema = z.object({
  clientSecret: z.string(),
  apiKey: z.string(),
  apiKeySigningKeyPair: z.string()
})

export const AllFieldsSchema = AppUpdateableFieldsSchema
  .merge(AppReadableFieldsSchema)
  .merge(AppInternalFieldSchema)

export type AppUpdateableFields = z.infer<typeof AppUpdateableFieldsSchema>
export type AppReadableFields = z.infer<typeof AppReadableFieldsSchema>
export type AppInternalFieldSchema = z.infer<typeof AppInternalFieldSchema>
export type AppAllFields = z.infer<typeof AllFieldsSchema>

export type AppPublishRequestParams = z.infer<typeof AppPublishRequestParamsSchema>

export const AppPublishRequestParamsSchema = z.object({
  clientId: z.string(),
  published: z.boolean()
})

export type AppProfileResult = object

export const AppClientIdParamSchema = z.object({
  clientId: z.string()
})

export type AppClientIdParam = z.infer<typeof AppClientIdParamSchema>

//TODO(betim): remove
// export type AppScopesResult = {
//   scopes: Record<string, ScopeDescriptor>
// }

export type AppAuthCheckParams = z.infer<typeof AppAuthCheckParamsSchema>

export const AppAuthCheckParamsSchema = z.object({
  redirectURI: z.string(),
  scopes: z.array(z.string()),
  clientId: z.string(),
  clientSecret: z.string().optional()

})

export type AppRotateSecretResult = z.infer<typeof AppRotateSecretResultSchema>

export const AppRotateSecretResultSchema = z.object({
  secret: z.string()
})


//TODO(betim): fix/remove these two
export type AppApiKeyCheckParams = [key: AppAPIKeyValidityRequest]

export const AppApiKeyCheckParamsSchema = z.ZodError


export const AppAPIKeyValidityResultSchema = z.object({
  valid: z.boolean()
})
export type AppAPIKeyValidityResult = z.infer<typeof AppAPIKeyValidityResultSchema>

export type AppAPIKeyValidityRequest = z.infer<typeof AppAPIKeyValidityRequestSchema>

export const AppAPIKeyValidityRequestSchema = z.object({
  apiKey: z.string()
})

export const AppAPIKeyResultSchema = z.object({
  apiKey: z.string()
}) 

export type AppAPIKeyResult = z.infer<typeof AppAPIKeyResultSchema>
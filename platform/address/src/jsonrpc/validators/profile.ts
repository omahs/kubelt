import { z } from 'zod'

const NFTarTraitsSchema = z.object({
  type: z.string(),
  value: z.object({
    rnd: z.array(z.number()),
    name: z.string(),
    rgb: z.object({
      r: z.number(),
      g: z.number(),
      b: z.number(),
    }),
  }),
})

export const NFTarVoucherSchema = z.object({
  recipient: z.string(),
  uri: z.string(),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    cover: z.string(),
    image: z.string(),
    external_url: z.string(),
    properties: z.object({
      metadata: z.object({
        blockchain: z.object({
          properties: z.object({
            name: z.string(),
            chain: z.string(),
          }),
        }),
      }),
      traits: z.object({
        trait0: NFTarTraitsSchema,
        trait1: NFTarTraitsSchema,
        trait2: NFTarTraitsSchema,
        trait3: NFTarTraitsSchema,
      }),
    }),
  }),
})

export const CryptoAddressProfileSchema = z.object({
  address: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  nftarVoucher: z.any().optional(),
})

export const GoogleRawProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string(),
  locale: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
})

export const AddressProfileSchema = z.union([
  CryptoAddressProfileSchema,
  GoogleRawProfileSchema,
])

import { z } from 'zod'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { Address } from '@kubelt/types'
import { AnyURN, parseURN } from '@kubelt/urns'
import { EdgeURN } from '@kubelt/urns/edge'

export const AddressURNInput = z.custom<AddressURN>((input) => {
  if (!AddressURNSpace.is(input)) {
    throw new Error(`invalid AddressURN entry: ${input}`)
  }
  return input as AddressURN
})

export const AccountURNInput = z.custom<AccountURN>((input) => {
  if (AccountURNSpace.parse(input as AccountURN) === null) {
    throw new Error('Invalid AccountURN entry')
  }
  return input as AccountURN
})

export const CryptoAddressTypeInput = z.custom<Address.CryptoAddressType>(
  (input) => {
    let addrType: Address.CryptoAddressType
    switch (input) {
      case Address.CryptoAddressType.Ethereum:
        addrType = Address.CryptoAddressType.Ethereum
        break
      case Address.CryptoAddressType.ETH:
        addrType = Address.CryptoAddressType.ETH
        break
      default:
        throw new TypeError(`invalid crypto address type: ${input}`)
    }

    return addrType
  }
)

export const AnyURNInput = z.custom<AnyURN>((input) => {
  parseURN(input as string)
  return input as AnyURN
})

export const EdgeTagInput = z.custom<EdgeURN>((input) => {
  parseURN(input as string)
  return input as EdgeURN
})

export const EdgeDirectionInput = z.enum(['incoming', 'outgoing'])

export const NodeFilterInput = z.object({
  id: AnyURNInput.optional(),
  fr: z.string().optional(),
  qc: z.record(z.string(), z.string().optional()).optional(),
  rc: z.record(z.string(), z.string().optional()).optional(),
})

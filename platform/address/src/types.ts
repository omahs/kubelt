import { z } from 'zod'
import { GetGoogleOAuthDataSchema } from './jsonrpc/validators/oauth'
import {
  CryptoAddressProfileSchema,
  GoogleRawProfileSchema,
  NFTarVoucherSchema,
} from './jsonrpc/validators/profile'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  CryptoAddress: DurableObjectNamespace
  ContractAddress: DurableObjectNamespace
  OAuthAddress: DurableObjectNamespace

  COLLECTIONS: D1Database

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  BLOCKCHAIN_ACTIVITY: Queue
}

export enum NodeType {
  Crypto = 'crypto',
  Contract = 'contract',
  OAuth = 'oauth',
}

export enum CryptoAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export enum ContractAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export enum OAuthAddressType {
  Google = 'google',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | ContractAddressType

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: string[]
  state: string
  timestamp: number
}

export type OAuthGoogleProfile = z.infer<typeof GoogleRawProfileSchema>
export type CryptoAddressProfile = z.infer<typeof CryptoAddressProfileSchema>
export type AddressProfile = CryptoAddressProfile | OAuthGoogleProfile

export type OAuthGoogleData = z.infer<typeof GetGoogleOAuthDataSchema>

export type OAuthDataSchema = OAuthGoogleData // TODO: change to z.union when more are supported

export type NFTarVoucher = z.infer<typeof NFTarVoucherSchema>

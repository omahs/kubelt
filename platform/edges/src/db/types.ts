// @kubelt/platform.edges:src/db/types.ts

/**
 * Edge-related types.
 */

import { z } from 'zod'

import type { AnyURN } from '@kubelt/urns'
import { EdgeURN } from '@kubelt/urns/edge'
import {
  EdgeDirectionInput,
  NodeFilterInput,
} from '@kubelt/platform-middleware/inputValidators'
import { EdgeQueryInput, Edge, Node } from '../jsonrpc/middleware/validators'

// Types
// -----------------------------------------------------------------------------

export type EdgeQuery = z.infer<typeof EdgeQueryInput>

export type Edge = z.infer<typeof Edge>

export type Node = z.infer<typeof Node>

export type EdgeDirection = z.infer<typeof EdgeDirectionInput>

export type NodeFilter = z.infer<typeof NodeFilterInput>

export type Permission = string

export type EdgeTag = EdgeURN

// An authorization token
export type Token = string

export type EdgeId = number

export interface Graph {
  // The binding for the D1 edges database.
  db: D1Database
}

export interface NodeRecord {
  // The full node URN
  urn: AnyURN
  // The URN namespace ID
  nid: string
  // The URN namespace-specific string
  nss: string
  // An optional fragment
  fragment?: string
}

export interface EdgeRecord {
  // The edge identifier
  id: number
  // The URN of the source node, where the edge originates.
  src: AnyURN
  // The URN of the sink node, where the edge terminates.
  dst: AnyURN
  // The "type" of the edge.
  tag: EdgeTag
}

export interface QComponent {
  key: string
  value: string
}

export type QComponents = Record<string, string>

export interface RComponent {
  key: string
  value: string
}

export type RComponents = Record<string, string>

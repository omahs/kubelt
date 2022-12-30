// @kubelt/graph:edges.ts

import type { EdgeURN } from '@kubelt/urns/edge'

import { edge } from './index'

/**
 * Available platform edge types.
 */

/**
 * An edge representing the connection between an application and its
 * owner. The source should be the owning node, and the destination the
 * application node.
 */
export const EDGE_APPLICATION: EdgeURN = edge('owns/app')

/**
 * An edge linking an account node (representing a user account) and an
 * address node (one of the addresses that the user has claimed as their
 * own).
 */
export const EDGE_ADDRESS: EdgeURN = edge('owns/address')

/**
 * An edge linking an account node (representing a user account) and a
 * client session node for that account.
 */
export const EDGE_ACCESS: EdgeURN = edge('owns/access')

// Edge Lists
// -----------------------------------------------------------------------------

export const EDGES_LIST = [EDGE_ACCESS, EDGE_ADDRESS, EDGE_APPLICATION]

export const EDGES_SET = new Set(EDGES_LIST)

// @kubelt/openrpc:middleware/local.ts

/**
 * Defines a middleware that rejects any non-local requests.
 */

// TODO implement guards for middleware that assert what data they expect to be in the context

// TODO support namespacing in middleware; set reverse-TLD namespace into which context values will be set

// TODO update the middleware() function to accept a reverse-TLD
// namespace that is used to constrain what values are injected into the
// context.

import type { RpcContext } from '@kubelt/openrpc'

import * as openrpc from '@kubelt/openrpc'

import { isFromCFBinding } from '@kubelt/utils'

// local
// -----------------------------------------------------------------------------

/**
 * Reject any request that doesn't originate at localhost. This is
 * useful as it allows for local development and testing, and also
 * allows service-bound Cloudflare Workers to perform requests (they're
 * co-located in an "isolate", read "host", when service binding is
 * configured).
 */
export default openrpc.middleware(
  async (request: Readonly<Request>, context: Readonly<RpcContext>) => {
    // NB: These are the request headers that seem relevant to the
    // determination of whether or not the incoming request is from a
    // bound service. Once we have an approach that is known good,
    // remove reference to any unnecessary headers.

    // "http", "https"
    //const forwardedProto = request.headers.get("x-forwarded-proto");

    // Request host, including port number if supplied.
    //const hostIP = request.headers.get("host");

    // E.g. "127.0.0.1"
    //const realIP = request.headers.get("x-real-ip");

    // E.g. "127.0.0.1"
    if (isFromCFBinding(request))
      // Allow middleware chain to continue.
      return context
      
    const connectingIP = request.headers.get('cf-connecting-ip')
    const message = `rejecting request from non-local address: ${connectingIP}`
    console.warn(message)

    // Should we return a JSON-RPC response? If so, the following call
    // required an RpcRequest as first argument, rather than a Request.
    /*
    return openrpc.error(request, {
      code: -1,
      message,
      data: {
        origin: connectingIP,
      },
    });
    */

    // Return a response to short-circuit execution of the middleware.
    // - 401 Unauthorized: must authenticate for access
    // - 403 Forbidden: authenticated (client ID known), but not allowed
    return new Response(message, { status: 401 })
  }
)

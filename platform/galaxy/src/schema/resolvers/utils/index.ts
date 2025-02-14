import { GraphQLYogaError } from '@graphql-yoga/common'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

import { AccountURN } from '@kubelt/urns/account'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import Env from '../../../env'
import { isFromCFBinding } from '@kubelt/utils'

// 404: 'USER_NOT_FOUND' as string,
export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}

export const setupContext = () => (next) => (root, args, context, info) => {
  const jwt = context.request.headers.get('KBT-Access-JWT-Assertion')
  const apiKey = context.request.headers.get('X-GALAXY-KEY')
  const parsedJwt = jwt && parseJwt(jwt)
  const accountURN: AccountURN = parsedJwt && parsedJwt.sub

  return next(root, args, { ...context, jwt, apiKey, accountURN }, info)
}

export const isAuthorized = () => (next) => (root, args, context, info) => {
  // TODO: update to check if user is authorized with authorzation header
  if (!context.jwt) {
    throw new GraphQLYogaError('You are not authenticated!', {
      extensions: {
        http: {
          status: 401,
        },
      },
    })
  }

  return next(root, args, context, info)
}

export const hasApiKey = () => (next) => async (root, args, context, info) => {

  //If request isn't coming from a service binding then we check for API key validity;
  //otherwise we passthrough to next middleware
  if (!isFromCFBinding(context.request)) {

    const apiKey = context.apiKey
    if (!apiKey) {
      throw new GraphQLYogaError('No API Key provided.', {
        extensions: {
          http: {
            status: 400,
          },
        },
      })
    }

    const env = context.env as Env
    const keyObj = {
      apiKey: apiKey
    }
    const starbaseClient = createStarbaseClient(env.Starbase)

    let apiKeyValidity
    try {
      apiKeyValidity = await starbaseClient.kb_appApiKeyCheck(keyObj)
    } catch (e) {
      throw new GraphQLYogaError('Unable to validate given API key.', {
        extensions: {
          http: {
            status: 401
          }
        }
      })
    }

    if (!apiKeyValidity.valid) {
      throw new GraphQLYogaError('Invalid API key provided.', {
        extensions: {
          http: {
            status: 401,
          },
        },
      })
    }
  }

  return next(root, args, context, info)
}


export async function checkHTTPStatus(response: Response) {
  if (response.status !== 200) {
    const json: { error: string } = await response.json()
    throw new GraphQLYogaError(
      `Error: ${response.status} ${response.statusText}: ${json.error}`,
      {
        extensions: {
          http: {
            status: response.status,
          },
        },
      }
    )
  }
}

export async function getRPCResult(response: Response) {
  const json: {
    error?: { message: string; code: string }
    result?: { value: any }
  } = await response.json()
  if (json.error) {
    // TODO: we should get proper error codes from the RPC
    let status = parseInt(json.error.code) > 0 ? json.error.code : 400
    switch (json.error.message) {
      case 'cannot authorize':
        status = 401
        break
    }
    throw new GraphQLYogaError(
      `Error: ${json.error?.code} ${json.error?.message}`,
      {
        extensions: {
          http: {
            status,
          },
        },
      }
    )
  }
  return json.result?.value
}

export function sliceIntoChunks(arr: any, chunkSize: number) {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk)
  }
  return res
}

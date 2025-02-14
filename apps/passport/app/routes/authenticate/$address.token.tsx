import { GrantType } from '@kubelt/platform.access/src/types'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import {
  getAccessClient,
  getAddressClient,
  getGalaxyClient,
} from '~/platform.server'
import { createUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams
  const { address } = params
  const node_type = searchParams.get('node_type') as string
  const addr_type = searchParams.get('addr_type') as string
  const state = searchParams.get('state') as string
  const code = searchParams.get('code') as string

  if (!address || !node_type || !addr_type || !code) {
    throw json({ message: 'Invalid params' }, 400)
  }
  const addressURN = `urn:threeid:address/${address}?+node_type=${node_type}&addr_type=${addr_type}`

  // TODO exchange token for access token
  const addressClient = getAddressClient(addressURN)
  const account = await addressClient.kb_resolveAccount()

  const grantType = GrantType.AuthenticationCode
  const redirectUri = PASSPORT_REDIRECT_URL
  const clientId = params.address as string

  const accessClient = getAccessClient()

  // TODO: handle refresh token
  try {
    const { accessToken, refreshToken } =
      await accessClient.exchangeToken.mutate({
        code,
        account,
        clientId,
        redirectUri,
        grantType,
      })

    const galaxyClient = await getGalaxyClient()
    await galaxyClient.getProfileFromAddress({
      addressURN,
    }) // lazy try to upgrade to profile in new account

    // TODO: store refresh token in DO and set alarm to refresh

    const redirectURL = searchParams.get('client_id')
      ? `/authorize?client_id=${searchParams.get('client_id')}&state=${state}`
      : `/authorize`
    return createUserSession(accessToken, redirectURL, addressURN)
  } catch (error) {
    console.error({ addressURN, error: JSON.stringify(error) })
    throw json({ message: 'invalid code' }, 400)
  }
}

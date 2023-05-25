import { EmailAddressType, NodeType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { JsonError } from '@proofzero/utils/errors'
import { json } from '@remix-run/cloudflare'
import { getAddressClient, getStarbaseClient } from '~/platform.server'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getAuthzCookieParams } from '~/session.server'
import { SendOTPEmailThemeProps } from '@proofzero/platform/email/src/jsonrpc/methods/sendOTPEmail'

export const loader: LoaderFunction = async ({ request, context }) => {
  try {
    const qp = new URL(request.url).searchParams

    const email = qp.get('email')
    if (!email) throw new Error('No address included in request')

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(EmailAddressType.Email, email),
      { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
      { alias: email, hidden: 'true' }
    )

    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )

    const { clientId } = await getAuthzCookieParams(request, context.env)

    const starbaseClient = getStarbaseClient(
      undefined,
      context.env,
      context.traceSpan
    )

    let appProps, emailTheme, customDomain
    if (clientId !== 'console' && clientId !== 'passport') {
      ;[appProps, emailTheme, customDomain] = await Promise.all([
        starbaseClient.getAppPublicProps.query({
          clientId,
        }),
        starbaseClient.getEmailOTPTheme.query({
          clientId,
        }),
        starbaseClient.getCustomDomain.query({
          clientId,
        }),
      ])
    }

    let themeProps: SendOTPEmailThemeProps | undefined
    if (appProps) {
      themeProps = {
        privacyURL: appProps.privacyURL as string,
        termsURL: appProps.termsURL as string,
        logoURL: emailTheme?.logoURL,
        contactURL: emailTheme?.contact,
        address: emailTheme?.address,
        appName: appProps.name,
      }

      // Commented out because
      // we need to figure out DKIM
      // for custom domains
      // https://github.com/proofzero/rollupid/issues/2326
      // if (customDomain) {
      //   themeProps.hostname = customDomain.hostname
      // }
    }

    const state = await addressClient.generateEmailOTP.mutate({
      email,
      themeProps,
    })
    return json({ state })
  } catch (e) {
    console.error('Error generating email OTP', e)
    throw JsonError(e)
  }
}

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  if (!email) throw new Error('No email address included in request')

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(EmailAddressType.Email, email),
    { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
    { alias: email, hidden: 'true' }
  )
  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )

  const successfulVerification = await addressClient.verifyEmailOTP.mutate({
    code: formData.get('code') as string,
    state: formData.get('state') as string,
  })

  return json({ addressURN, successfulVerification })
}

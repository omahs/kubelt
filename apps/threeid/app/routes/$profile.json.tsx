import { LoaderFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/galaxyClient'
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from '~/helpers/voucher'

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error('Profile address required')
  }

  console.log('dans profile loader')

  // TODO: double check that this still throws an exception
  // TODO: remove claimed from response?
  try {
    console.log('getting client')
    const galaxyClient = await getGalaxyClient()
    console.log('getting profile', params.profile)
    const profileRes = await galaxyClient.getProfileFromAddress({
      address: params.profile,
    }).catch(e => console.log(e))

    console.log('got response', profileRes)

    return json({
      ...profileRes.profileFromAddress,
      claimed: true,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (e) {
    console.error("Couldn't find profile", e)
    console.log('error conditional', JSON.stringify(e?.response?.errors))
    if (e?.response?.errors) {
      // we have a handled exception from galaxy
      console.log('status',e.response.status)
      const status = e.response.errors[0]?.extensions?.extensions.http.status
      if (status === 404 || status === 400) {
        const error = `Failed to fetch profile with with resolver ${params.profile}: ${e.response.errors[0]?.message}`
        console.error(status, error)
        return json(error, {
          status: status,
        })
      }
    }

    let targetAddress = params.profile
    let profile: {
      displayName: string | null
      pfp: {
        image: string | null
        isToken: boolean
      }
      cover: string | null
    } = {
      displayName: null,
      pfp: {
        image: null,
        isToken: false,
      },
      cover: null,
    }

    console.log('attempting eth address:', targetAddress)

    // convert eth name to address (only works on mainnet)
    // this way we set the correct targetAddress for the voucher
    if (targetAddress?.endsWith('.eth')) {
      // TODO: stop gap unti we can sort out lookupName with ethers on worker
      const ensRes = await fetch(
        `https://api.ensideas.com/ens/resolve/${targetAddress}`
      )
      const res: {
        address: string
        avatar: string | null
        displayName: string | null
      } = await ensRes.json()
      targetAddress = res.address || targetAddress
      profile = {
        ...profile,
        pfp: { image: res.avatar, isToken: true },
        displayName: res.displayName,
      }
    }

    console.log(`into voucher generation for ${targetAddress} with profile`, profile)

    let voucher = await getCachedVoucher(targetAddress)
    if (!voucher) {
      console.log('getting new voucher')
      voucher = await fetchVoucher({
        address: targetAddress,
      })
      console.log('got new voucher')
      voucher = await putCachedVoucher(targetAddress, voucher)
    }

    console.log('got voucher', voucher)

    profile.pfp.image ||= voucher.metadata.image
    profile.cover ||= voucher.metadata.cover

    console.log('got profile', profile)

    return json({
      ...profile,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

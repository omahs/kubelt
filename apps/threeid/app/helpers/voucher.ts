import { json } from 'stream/consumers'
import { AlchemyClient } from '~/utils/alchemy.server'
import { gatewayFromIpfs } from './gateway-from-ipfs'

type FetchVoucherParams = {
  address: string
}

export const fetchVoucher = async ({ address }: FetchVoucherParams) => {
  // @ts-ignore
  if (!NFTAR_URL) {
    throw new Error("Make sure 'NFTAR_URL' env variable is set.")
  }  
  // @ts-ignore
  const nftarUrl: string = NFTAR_URL

  // @ts-ignore
  if (!NFTAR_AUTHORIZATION) {
    throw new Error("Make sure 'NFTAR_AUTHORIZATION' env variable is set.")
  }  
  // @ts-ignore
  const nftarToken: string = NFTAR_AUTHORIZATION

  // @ts-ignore
  if (!MINTPFP_CONTRACT_ADDRESS) {
    throw new Error("Make sure 'MINTPFP_CONTRACT_ADDRESS' env variable is set.")
  }  
  // @ts-ignore
  const contractAddress: string = MINTPFP_CONTRACT_ADDRESS

  // @ts-ignore
  const chainId: string = NFTAR_CHAIN_ID

  // @ts-ignore
  if (!ALCHEMY_NFT_API_URL) {
    throw new Error("Make sure 'ALCHEMY_NFT_API_URL' env variable is set.")
  }  
  const alchemyUrl: string = ALCHEMY_NFT_API_URL

  // check if the user has already minted
  const alchemy = new AlchemyClient(alchemyUrl)
  console.log('alchemy client', JSON.stringify(alchemy))

  const nfts = await alchemy.getNFTsForOwner(address, {
    contracts: [contractAddress],
  })

  console.log('got alchemy nfts', nfts)

  if (nfts.ownedNfts.length > 0) {
    const voucher = {
      chainId,
      contractAddress,
      minted: true,
      metadata: nfts.ownedNfts[0].metadata,
    }
    console.log('putting voucher', voucher)
    await putCachedVoucher(address, voucher)
    console.log('returning voucher', voucher)
    return { contractAddress, voucher }
  }

  const nftarFetch = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${nftarToken}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: '3id_genPFP',
      params: {
        account: address,
        blockchain: {
          name: 'ethereum',
          chainId,
        },
      },
    }),
  }

  console.log('nftarFetch', nftarFetch)
  const response = await fetch(`${nftarUrl}`, nftarFetch)

  console.log('got response', response)

  const jsonRes = await response.json()

  console.log('got json', jsonRes)

  if (jsonRes.error) {
    throw new Error(jsonRes.error.data.message)
  }

  let res = {
    ...jsonRes.result,
    contractAddress,
  }

  res.metadata.cover = gatewayFromIpfs(jsonRes.result.metadata.cover)
  res.metadata.image = gatewayFromIpfs(jsonRes.result.metadata.image)

  console.log('fire and forget', res)

  // fire and forget to hotload image
  fetch(res.metadata.image)
  fetch(res.metadata.cover)

  console.log('after fire and forget')

  return res
}

export const getCachedVoucher = async (address: string) => {
  // @ts-ignore
  return VOUCHER_CACHE.get(address, { type: 'json' })
}

export const putCachedVoucher = async (address: string, voucher: any) => {
  // @ts-ignore
  let cachedVoucher = await VOUCHER_CACHE.get(address, { type: 'json' })
  if (!cachedVoucher) {
    cachedVoucher = {
      // @ts-ignore
      chainId: NFTAR_CHAIN_ID,
      // @ts-ignore
      contractAddress: MINTPFP_CONTRACT_ADDRESS,
      minted: false,
    }
  }

  const updatedVoucher = {
    ...cachedVoucher,
    ...voucher,
  }

  // @ts-ignore
  await VOUCHER_CACHE.put(address, JSON.stringify(updatedVoucher))

  return updatedVoucher
}

export type NFTMedia = {
  raw: string
  gateway: string
  thumbnail: string
  format: string
  bytes: number
}

export type GetNFTsResponse = {
  ownedNfts: {
    contract: {
      address: string
    }
    title: string
    description: string
    tokenUri: {
      raw: string
      gateway: string
    }
    media: NFTMedia | NFTMedia[]
    error?: string
    metadata: {
      image: string
      external_url: string
      background_color: string
      name: string
      description: string
      properties?: any
      attributes: Array<{
        value: string
        trait_type: string
        display_type?: string
      }>
      media: NFTMedia | NFTMedia[]
      timeLastUpdated: number
    }
    contractMetadata: {
      name: string
      symbol: string
      totalSupply: string
      tokenType: string
      openSea?: {
        floorPrice: string
        collectionName: string
        safeListRequestStatus: string
        imageUrl: string
        description: string
        externalUrl: string
        twitterUsername: string
        discordUrl: string
      }
    }
  }[]
  pageKey: string
  totalCount: string
  blockHash: string
}

export class AlchemyClient {
  alchemyUrl: string

  constructor(alchemyUrl: string) {
    // @ts-ignore
    if (!alchemyUrl) {
      throw new Error("Make sure 'ALCHEMY_NFT_API_URL' env variable is set and passed to AlchemyClient.")
    }
    this.alchemyUrl = alchemyUrl
  }

  async getNFTsForOwner(
    address: string,
    options?: {
      contracts?: string[] | null
      pageKey?: string | null
      withMetadata?: boolean | null
      pageSize?: number | null
    }
  ): Promise<GetNFTsResponse> {
    // @ts-ignore
    if (!this.alchemyUrl) {
      throw new Error("Make sure 'ALCHEMY_NFT_API_URL' env variable is set and passed to AlchemyClient.")
    }

    // @ts-ignore
    const reqUrl = new URL(`${this.alchemyUrl}/getNFTs`)
    reqUrl.searchParams.set('owner', address)

    options?.contracts &&
      options.contracts.forEach((contract, idx) =>
        reqUrl.searchParams.append('contractAddresses[]', contract)
      )

    options?.pageKey && reqUrl.searchParams.set('pageKey', options.pageKey)

    options?.pageSize &&
      reqUrl.searchParams.set('pageSize', '' + options.pageSize)

    options?.withMetadata &&
      reqUrl.searchParams.set('withMetadata', options.withMetadata.toString())

    reqUrl.searchParams.append('filters[]', 'SPAM')

    // Adding AIRDROPS to filter removes 3iD invites
    // reqUrl.searchParams.append('filters[]', 'AIRDROPS');

    const response = await fetch(reqUrl.toString(), {
      headers: { accept: 'application/json' },
    })

    if (response.status !== 200) {
      console.log('failed with status', response.status)
      throw new Error(
        `Failed to fetch NFTs with request: ${await response.text()}`
      )
    }

    return response.json()
  }
}

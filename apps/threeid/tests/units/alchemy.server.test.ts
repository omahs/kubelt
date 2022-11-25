import * as dotenv from 'dotenv'
import {describe, expect, test, beforeAll, afterAll, jest} from '@jest/globals'

import { ALCHEMY_NFT_FIXTURE } from './fixtures'
import { AlchemyClient } from '../../app/utils/alchemy.server'

describe('Test the AlchemyClient', () => {

  const BASELINE_ENV = process.env
  
  beforeAll(() => {
    // Note that this path is relative to where the test is run from, which should be the root of the project.
    const result = dotenv.config({ path: '.dev.vars' })
    if (result.error) {
      throw result.error
    }
  })

  afterAll(() => {
    process.env = BASELINE_ENV
  })

  test('Bootstrapping AlchemyClient', () => {
		const alchemy = new AlchemyClient(process.env.ALCHEMY_NFT_API_URL as string)
    expect(alchemy).toBeDefined()
	})

  test('getNFTsForOwner happy path', async () => {
    //@ts-ignore
    global.fetch = jest.fn(async () => {
      return {
        status: 200,
        json: async () => ALCHEMY_NFT_FIXTURE
      }
    })
    
    const alchemy = new AlchemyClient(process.env.ALCHEMY_NFT_API_URL as string)
    const address = '0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52' // alfl.eth
    const nfts = await alchemy.getNFTsForOwner(address)
    
    expect(nfts).toEqual(ALCHEMY_NFT_FIXTURE)
	})

  test('getNFTsForOwner unhappy path', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return {
        status: 500,
        text: async () => 'Mock Internal Server Error'
      }
    })

    const alchemy = new AlchemyClient(process.env.ALCHEMY_NFT_API_URL as string)
    const address = '0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52' // alfl.eth

    expect(async () => await alchemy.getNFTsForOwner(address)).rejects.toThrow()
	})
})
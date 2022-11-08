import { composeResolvers } from '@graphql-tools/resolvers-composition'
import Env from '../../env'
import OortClient from './clients/oort'
import { setupContext } from './utils'

import { Resolvers } from './typedefs'

type ResolverContext = {
  env: Env
  jwt: string
}

const ensResolvers: Resolvers = {
  Query: {
    ensLookup: async (
      _parent: any,
      { address },
      { env, jwt }: ResolverContext
    ) => {
      console.log({
        jwt,
      })

      const oortClient = new OortClient(env.OORT, jwt)

      console.log('OORT REQUESTS')

      const addressLookupRes = await oortClient
        .send('ens_lookupAddress', [address])
        .then((res) => res.json())
      const coreEnsLookup = await oortClient
        .send('kb_getCoreAddresses', [['ens']])
        .then((res) => res.json())

      console.log({
        addressLookupRes,
        coreEnsLookup,
      })

      return {
        name: 'Foo',
        setOnCore: false,
      }
    },
  },
  Mutation: {},
}

export default composeResolvers(ensResolvers, {
  'Query.ensLookup': [setupContext()],
})

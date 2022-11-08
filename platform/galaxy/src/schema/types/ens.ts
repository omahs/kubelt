export default /* GraphQL */ `
  type AddressENS {
    name: String
    setOnCore: Boolean
  }

  input ENSLinkInput {
    name: String
  }

  type Query {
    ensLookup(address: String!): AddressENS
  }

  type Mutation {
    registerENS(address: String!): Boolean
    unregisterENS(address: String!): Boolean
  }
`

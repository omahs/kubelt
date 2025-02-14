export default interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;

  Account: Fetcher
  Address: Fetcher
  Starbase: Fetcher
  Indexer: Fetcher
  APIKEY_ALCHEMY_ETH: string
  ALCHEMY_ETH_NETWORK: string
  APIKEY_ALCHEMY_POLYGON: string
  ALCHEMY_POLYGON_NETWORK: string
}

export const required = [
  'Account',
  'Address',
  'Starbase',
  'Indexer',
  'APIKEY_ALCHEMY_ETH',
  'ALCHEMY_ETH_NETWORK',
  'APIKEY_ALCHEMY_POLYGON',
  'ALCHEMY_POLYGON_NETWORK',
]

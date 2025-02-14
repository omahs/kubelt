export interface Environment {
  Bucket: R2Bucket
  Meta: DurableObjectNamespace
}

export interface IndexRecord {
  version: number
  visibility: string
}

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

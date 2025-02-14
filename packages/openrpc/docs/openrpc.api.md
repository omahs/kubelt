## API Report File for "@kubelt/openrpc"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

/// <reference types="@cloudflare/workers-types" />

import type { ContentDescriptorObjectName } from '@open-rpc/meta-schema';
import type { MethodObject } from '@open-rpc/meta-schema';
import type { OpenrpcDocument } from '@open-rpc/meta-schema';

// @public
export function build(service: Readonly<RpcService>, base: Readonly<RpcPath>, root: Readonly<RpcPath>, chain?: Readonly<RpcChain>): OpenRpcHandler;

// @public (undocumented)
export function chain(rpcChain: Readonly<RpcChain>): Readonly<RpcChain>;

// Warning: (ae-forgotten-export) The symbol "RpcClientOptions" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "RpcClient" needs to be exported by the entry point index.d.ts
//
// @public
export function client(durableObject: DurableObjectNamespace, name: string, schema: RpcSchema, options?: RpcClientOptions): RpcClient;

// @public
export function context(): RpcContext;

// @public
export function discover(durableObject: DurableObjectNamespace, name: string, options?: RpcClientOptions): Promise<RpcClient>;

// @public
export function error(request: Readonly<RpcRequest>, detail: Readonly<RpcErrorDetail>): Promise<Readonly<RpcError>>;

// @public
export function extend(service: Readonly<RpcService>, extension: Readonly<RpcMethod>): Readonly<RpcService>;

// @public
export function extension(schema: Readonly<RpcSchema>, ext: Readonly<ServiceExtension>): Readonly<RpcMethod>;

// @public
export function extensions(schema: Readonly<RpcSchema>, methodSet: Readonly<RpcMethodSet>): Readonly<RpcMethods>;

// @public (undocumented)
export function handler(f: Readonly<RpcHandler>): Readonly<RpcHandler>;

// @public
export function method(schema: Readonly<RpcSchema>, serviceMethod: Readonly<ServiceMethod>): Readonly<RpcMethod>;

// @public
export function methods(schema: Readonly<RpcSchema>, methodSet: Readonly<RpcMethodSet>): Readonly<RpcMethods>;

// Warning: (ae-forgotten-export) The symbol "RpcChainFn" needs to be exported by the entry point index.d.ts
//
// @public
export function middleware(f: Readonly<RpcChainFn>): MiddlewareFn;

// @public (undocumented)
export type MiddlewareFn = (request: Request, context: RpcContext) => MiddlewareResult;

// @public (undocumented)
export type MiddlewareResult = Promise<Response | void>;

// @public (undocumented)
export type OpenRpcHandler = (request: Readonly<Request>, context?: Readonly<RpcContext>) => Promise<Response>;

// @public (undocumented)
export function options(opt: Readonly<RpcOptions>): RpcOptions;

// @public
export function response(request: Readonly<RpcRequest>, result: unknown): Promise<Readonly<RpcResponse>>;

// @public (undocumented)
export type RpcChain = ReadonlyArray<MiddlewareFn>;

// @public
export class RpcContext extends Map<string | Symbol, any> {
    // (undocumented)
    get(k: string | Symbol): any;
    // (undocumented)
    set(k: string | Symbol, v: any): this;
}

// Warning: (ae-forgotten-export) The symbol "jsonrpc" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export type RpcError = jsonrpc.JsonRpcErrorResponse;

// @public (undocumented)
export type RpcErrorDetail = jsonrpc.JsonRpcError;

// @public (undocumented)
export type RpcHandler = (service: Readonly<RpcService>, request: Readonly<RpcRequest>, context: Readonly<RpcContext>) => Promise<Readonly<RpcResponse>>;

// @public (undocumented)
export type RpcMethod = {
    name: symbol;
    schema: Readonly<MethodObject>;
    scopes: Readonly<ScopeSet>;
    handler: Readonly<RpcHandler>;
};

// @public (undocumented)
export type RpcMethods = Map<symbol, RpcMethod>;

// @public (undocumented)
export type RpcMethodSet = Array<RpcMethod>;

// Warning: (ae-forgotten-export) The symbol "Options" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export type RpcOptions = Partial<Options>;

// @public (undocumented)
export type RpcPath = string;

// @public (undocumented)
export type RpcRequest = jsonrpc.JsonRpcRequest;

// @public (undocumented)
export type RpcResponse = jsonrpc.JsonRpcResponse;

// @public (undocumented)
export type RpcSchema = OpenrpcDocument;

// @public (undocumented)
export type RpcService = {
    schema: Readonly<RpcSchema>;
    scopes: ScopeSet;
    methods: RpcMethods;
    extensions: RpcMethods;
};

// @public (undocumented)
export type Scope = symbol;

// @public
export function scope(name: string | Scope): Scope;

// @public
export function scopes(list: ReadonlyArray<string | Scope>): Readonly<ScopeSet>;

// @public (undocumented)
export type ScopeSet = Set<Scope>;

// @public
export function service(schema: Readonly<RpcSchema>, allScopes: Readonly<ScopeSet>, methods: Readonly<RpcMethods>, extensions: Readonly<RpcMethods>, clientOptions: Readonly<RpcOptions>): Readonly<RpcService>;

// @public (undocumented)
export type ServiceExtension = Omit<RpcMethod, 'name'>;

// @public (undocumented)
export type ServiceMethod = {
    name: RpcMethodName;
    scopes: Readonly<ScopeSet>;
    handler: Readonly<RpcHandler>;
};

// Warnings were encountered during analysis:
//
// impl/index.ts:117:3 - (ae-forgotten-export) The symbol "RpcMethodName" needs to be exported by the entry point index.d.ts

// (No @packageDocumentation comment for this package)

```

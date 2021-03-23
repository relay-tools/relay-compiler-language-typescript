/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { CacheConfig, ConcreteRequest, FetchPolicy, IEnvironment, RenderPolicy, VariablesOf } from "relay-runtime";
import { EnvironmentProviderOptions, LoadQueryOptions, PreloadedQuery, loadQuery, useLazyLoadQuery, usePreloadedQuery, useQueryLoader } from "react-relay";

export type appInitialStateQueryVariables = {};
export type appInitialStateQueryResponse = {
    readonly viewer: {
        readonly isAppending: boolean;
    } | null;
};
export type appInitialStateQuery = {
    readonly response: appInitialStateQueryResponse;
    readonly variables: appInitialStateQueryVariables;
};



/*
query appInitialStateQuery {
  viewer {
    isAppending
    id
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isAppending",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "appInitialStateQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "appInitialStateQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "03c9f68a6f38062cc31455f0fa26db18",
    "id": null,
    "metadata": {},
    "name": "appInitialStateQuery",
    "operationKind": "query",
    "text": "query appInitialStateQuery {\n  viewer {\n    isAppending\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = 'f0efd7247fc9e3c41041052e6cb44900';

export default node;

export function loadAppInitialStateQuery<TEnvironmentProviderOptions extends EnvironmentProviderOptions = {}>(
  environment: IEnvironment,
  variables: VariablesOf<appInitialStateQuery> = {},
  options?: LoadQueryOptions,
  environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQuery<appInitialStateQuery, TEnvironmentProviderOptions> {
  return loadQuery(environment, node, variables, options, environmentProviderOptions)
}
export function useAppInitialStateQuery(variables: VariablesOf<appInitialStateQuery> = {}, options?: {
  fetchKey?: string | number;
  fetchPolicy?: FetchPolicy;
  networkCacheConfig?: CacheConfig;
  UNSTABLE_renderPolicy?: RenderPolicy;
}) {
  return useLazyLoadQuery<appInitialStateQuery>(node, variables, options)
}
export function useAppInitialStateQueryLoader(initialQueryReference?: PreloadedQuery<appInitialStateQuery> | null) {
  return useQueryLoader(node, initialQueryReference)
}
export function usePreloadedAppInitialStateQuery(preloadedQuery: PreloadedQuery<appInitialStateQuery>, options?: {
  UNSTABLE_renderPolicy?: RenderPolicy;
}) {
  return usePreloadedQuery<appInitialStateQuery>(node, preloadedQuery, options)
}

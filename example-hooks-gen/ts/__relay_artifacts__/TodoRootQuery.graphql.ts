/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { CacheConfig, ConcreteRequest, FetchPolicy, IEnvironment, RenderPolicy, VariablesOf } from "relay-runtime";
import { EnvironmentProviderOptions, LoadQueryOptions, PreloadedQuery, loadQuery, useLazyLoadQuery, usePreloadedQuery, useQueryLoader } from "react-relay";

import { FragmentRefs } from "relay-runtime";
export type TodoRootQueryVariables = {
    first?: number | null;
    last?: number | null;
};
export type TodoRootQueryResponse = {
    readonly viewer: {
        readonly " $fragmentRefs": FragmentRefs<"TodoAppData">;
    } | null;
};
export type TodoRootQuery = {
    readonly response: TodoRootQueryResponse;
    readonly variables: TodoRootQueryVariables;
};



/*
query TodoRootQuery(
  $first: Int
  $last: Int
) {
  viewer {
    ...TodoAppData_2pIUTM
    id
  }
}

fragment TodoAppData_2pIUTM on User {
  id
  totalCount
  isAppending
  ...TodoListFooterData
  ...TodoList_4754yZ
}

fragment TodoData on Todo {
  complete
  id
  text
}

fragment TodoListFooterData on User {
  id
  isAppending
  completedCount
  completedTodos: todos(status: "completed", first: 2147483647) {
    edges {
      node {
        id
        complete
      }
    }
  }
  totalCount
}

fragment TodoList_4754yZ on User {
  todos(first: $first, last: $last) {
    edges {
      node {
        id
        complete
        ...TodoData
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
  id
  totalCount
  completedCount
  ...TodoViewer
}

fragment TodoViewer on User {
  id
  totalCount
  completedCount
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "last"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "complete",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TodoRootQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": (v1/*: any*/),
            "kind": "FragmentSpread",
            "name": "TodoAppData"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TodoRootQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isAppending",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "completedCount",
            "storageKey": null
          },
          {
            "alias": "completedTodos",
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 2147483647
              },
              {
                "kind": "Literal",
                "name": "status",
                "value": "completed"
              }
            ],
            "concreteType": "TodoConnection",
            "kind": "LinkedField",
            "name": "todos",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "TodoEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Todo",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "todos(first:2147483647,status:\"completed\")"
          },
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "TodoConnection",
            "kind": "LinkedField",
            "name": "todos",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "TodoEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Todo",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "text",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PageInfo",
                "kind": "LinkedField",
                "name": "pageInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endCursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasPreviousPage",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "startCursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v1/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "TodoList_todos",
            "kind": "LinkedHandle",
            "name": "todos"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ccd3641c04d762a35921175c0ad11224",
    "id": null,
    "metadata": {},
    "name": "TodoRootQuery",
    "operationKind": "query",
    "text": "query TodoRootQuery(\n  $first: Int\n  $last: Int\n) {\n  viewer {\n    ...TodoAppData_2pIUTM\n    id\n  }\n}\n\nfragment TodoAppData_2pIUTM on User {\n  id\n  totalCount\n  isAppending\n  ...TodoListFooterData\n  ...TodoList_4754yZ\n}\n\nfragment TodoData on Todo {\n  complete\n  id\n  text\n}\n\nfragment TodoListFooterData on User {\n  id\n  isAppending\n  completedCount\n  completedTodos: todos(status: \"completed\", first: 2147483647) {\n    edges {\n      node {\n        id\n        complete\n      }\n    }\n  }\n  totalCount\n}\n\nfragment TodoList_4754yZ on User {\n  todos(first: $first, last: $last) {\n    edges {\n      node {\n        id\n        complete\n        ...TodoData\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n  id\n  totalCount\n  completedCount\n  ...TodoViewer\n}\n\nfragment TodoViewer on User {\n  id\n  totalCount\n  completedCount\n}\n"
  }
};
})();
(node as any).hash = '847239069da1c22909392ce134dd18e7';

export default node;

export function loadTodoRootQuery<TEnvironmentProviderOptions extends EnvironmentProviderOptions = {}>(
  environment: IEnvironment,
  variables: VariablesOf<TodoRootQuery>,
  options?: LoadQueryOptions,
  environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQuery<TodoRootQuery, TEnvironmentProviderOptions> {
  return loadQuery(environment, node, variables, options, environmentProviderOptions)
}
export function useTodoRootQuery(variables: VariablesOf<TodoRootQuery>, options?: {
  fetchKey?: string | number;
  fetchPolicy?: FetchPolicy;
  networkCacheConfig?: CacheConfig;
  UNSTABLE_renderPolicy?: RenderPolicy;
}) {
  return useLazyLoadQuery<TodoRootQuery>(node, variables, options)
}
export function useTodoRootQueryLoader(initialQueryReference?: PreloadedQuery<TodoRootQuery> | null) {
  return useQueryLoader(node, initialQueryReference)
}
export function usePreloadedTodoRootQuery(preloadedQuery: PreloadedQuery<TodoRootQuery>, options?: {
  UNSTABLE_renderPolicy?: RenderPolicy;
}) {
  return usePreloadedQuery<TodoRootQuery>(node, preloadedQuery, options)
}

/* tslint:disable */
/* eslint-disable */

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type appQueryVariables = {};
export type appQueryResponse = {
    readonly viewer: {
        readonly " $fragmentRefs": FragmentRefs<"TodoApp_viewer">;
    } | null;
};
export type appQuery = {
    readonly response: appQueryResponse;
    readonly variables: appQueryVariables;
};



/*
query appQuery {
  viewer {
    ...TodoApp_viewer
    id
  }
}

fragment TodoApp_viewer on User {
  id
  totalCount
  ...TodoListFooter_viewer
  ...TodoList_viewer
}

fragment TodoListFooter_viewer on User {
  id
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

fragment TodoList_viewer on User {
  todos(first: 2147483647) {
    edges {
      node {
        id
        complete
        ...Todo_todo
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  id
  totalCount
  completedCount
  ...Todo_viewer
}

fragment Todo_todo on Todo {
  complete
  id
  text
}

fragment Todo_viewer on User {
  id
  totalCount
  completedCount
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "kind": "Literal",
  "name": "first",
  "value": 2147483647
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "complete",
  "storageKey": null
},
v3 = [
  (v1/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "appQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "TodoApp_viewer"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "appQuery",
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
            "name": "totalCount",
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
              (v1/*: any*/),
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
                      (v0/*: any*/),
                      (v2/*: any*/)
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
            "args": (v3/*: any*/),
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
                      (v0/*: any*/),
                      (v2/*: any*/),
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
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "todos(first:2147483647)"
          },
          {
            "alias": null,
            "args": (v3/*: any*/),
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
    "cacheID": "4c8e1cd3789353fb74f525880f3f0f53",
    "id": null,
    "metadata": {},
    "name": "appQuery",
    "operationKind": "query",
    "text": "query appQuery {\n  viewer {\n    ...TodoApp_viewer\n    id\n  }\n}\n\nfragment TodoApp_viewer on User {\n  id\n  totalCount\n  ...TodoListFooter_viewer\n  ...TodoList_viewer\n}\n\nfragment TodoListFooter_viewer on User {\n  id\n  completedCount\n  completedTodos: todos(status: \"completed\", first: 2147483647) {\n    edges {\n      node {\n        id\n        complete\n      }\n    }\n  }\n  totalCount\n}\n\nfragment TodoList_viewer on User {\n  todos(first: 2147483647) {\n    edges {\n      node {\n        id\n        complete\n        ...Todo_todo\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n  totalCount\n  completedCount\n  ...Todo_viewer\n}\n\nfragment Todo_todo on Todo {\n  complete\n  id\n  text\n}\n\nfragment Todo_viewer on User {\n  id\n  totalCount\n  completedCount\n}\n"
  }
};
})();
(node as any).hash = '14aafc6977e28bcb7c5b2392f3fdae03';
export default node;

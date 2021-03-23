/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Disposable, IEnvironment, MutationConfig } from "relay-runtime";
import { useMutation } from "react-relay";

export type AddTodoInput = {
    text: string;
    clientMutationId?: string | null;
};
export type TodoAppAddTodoMutationVariables = {
    input: AddTodoInput;
    connections: Array<string>;
    append: boolean;
};
export type TodoAppAddTodoMutationResponse = {
    readonly addTodo: {
        readonly todoEdge?: {
            readonly __typename: string;
            readonly cursor: string;
            readonly node: {
                readonly complete: boolean | null;
                readonly id: string;
                readonly text: string | null;
            } | null;
        } | null;
        readonly viewer: {
            readonly id: string;
            readonly totalCount: number | null;
        } | null;
    } | null;
};
export type TodoAppAddTodoMutation = {
    readonly response: TodoAppAddTodoMutationResponse;
    readonly variables: TodoAppAddTodoMutationVariables;
};



/*
mutation TodoAppAddTodoMutation(
  $input: AddTodoInput!
  $append: Boolean! = true
) {
  addTodo(input: $input) {
    todoEdge @include(if: $append) {
      __typename
      cursor
      node {
        complete
        id
        text
      }
    }
    todoEdge @skip(if: $append) {
      __typename
      cursor
      node {
        complete
        id
        text
      }
    }
    viewer {
      id
      totalCount
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": true,
  "kind": "LocalArgument",
  "name": "append"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v3 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "viewer",
  "plural": false,
  "selections": [
    (v4/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "TodoEdge",
  "kind": "LinkedField",
  "name": "todoEdge",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Todo",
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "complete",
          "storageKey": null
        },
        (v4/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = [
  (v6/*: any*/)
],
v8 = [
  {
    "kind": "Variable",
    "name": "connections",
    "variableName": "connections"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TodoAppAddTodoMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "AddTodoPayload",
        "kind": "LinkedField",
        "name": "addTodo",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "condition": "append",
            "kind": "Condition",
            "passingValue": true,
            "selections": (v7/*: any*/)
          },
          {
            "condition": "append",
            "kind": "Condition",
            "passingValue": false,
            "selections": (v7/*: any*/)
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "TodoAppAddTodoMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "AddTodoPayload",
        "kind": "LinkedField",
        "name": "addTodo",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "condition": "append",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "appendEdge",
                "key": "",
                "kind": "LinkedHandle",
                "name": "todoEdge",
                "handleArgs": (v8/*: any*/)
              }
            ]
          },
          {
            "condition": "append",
            "kind": "Condition",
            "passingValue": false,
            "selections": [
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "prependEdge",
                "key": "",
                "kind": "LinkedHandle",
                "name": "todoEdge",
                "handleArgs": (v8/*: any*/)
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5ce6bcfd9fff5d1509633dea2ad0ef70",
    "id": null,
    "metadata": {},
    "name": "TodoAppAddTodoMutation",
    "operationKind": "mutation",
    "text": "mutation TodoAppAddTodoMutation(\n  $input: AddTodoInput!\n  $append: Boolean! = true\n) {\n  addTodo(input: $input) {\n    todoEdge @include(if: $append) {\n      __typename\n      cursor\n      node {\n        complete\n        id\n        text\n      }\n    }\n    todoEdge @skip(if: $append) {\n      __typename\n      cursor\n      node {\n        complete\n        id\n        text\n      }\n    }\n    viewer {\n      id\n      totalCount\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '9fc424b62b7e322b67f3f1222bad0a76';

export default node;


export function useTodoAppAddTodoMutation(mutationConfig?: (environment: IEnvironment, config: MutationConfig<TodoAppAddTodoMutation>) => Disposable) {
  return useMutation<TodoAppAddTodoMutation>(node, mutationConfig)
}

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Disposable, IEnvironment, MutationConfig } from "relay-runtime";
import { useMutation } from "react-relay";

export type RemoveTodoInput = {
    id: string;
    clientMutationId?: string | null;
};
export type TodoRemoveMutationVariables = {
    input: RemoveTodoInput;
};
export type TodoRemoveMutationResponse = {
    readonly removeTodo: {
        readonly deletedTodoId: string | null;
        readonly viewer: {
            readonly completedCount: number | null;
            readonly totalCount: number | null;
        } | null;
    } | null;
};
export type TodoRemoveMutation = {
    readonly response: TodoRemoveMutationResponse;
    readonly variables: TodoRemoveMutationVariables;
};



/*
mutation TodoRemoveMutation(
  $input: RemoveTodoInput!
) {
  removeTodo(input: $input) {
    deletedTodoId
    viewer {
      completedCount
      totalCount
      id
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedTodoId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "completedCount",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TodoRemoveMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveTodoPayload",
        "kind": "LinkedField",
        "name": "removeTodo",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "viewer",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TodoRemoveMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveTodoPayload",
        "kind": "LinkedField",
        "name": "removeTodo",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "viewer",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "31c64c621ad9cd75bc50e70fe782a8b8",
    "id": null,
    "metadata": {},
    "name": "TodoRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation TodoRemoveMutation(\n  $input: RemoveTodoInput!\n) {\n  removeTodo(input: $input) {\n    deletedTodoId\n    viewer {\n      completedCount\n      totalCount\n      id\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '16e175a96ed4d43d8535a82cd1b3476e';

export default node;


export function useTodoRemoveMutation(mutationConfig?: (environment: IEnvironment, config: MutationConfig<TodoRemoveMutation>) => Disposable) {
  return useMutation<TodoRemoveMutation>(node, mutationConfig)
}

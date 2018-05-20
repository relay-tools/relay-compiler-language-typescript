/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type RemoveCompletedTodosMutationVariables = {
    readonly input: {
        readonly clientMutationId?: string | null;
    };
};
export type RemoveCompletedTodosMutationResponse = {
    readonly removeCompletedTodos: ({
        readonly deletedTodoIds: ReadonlyArray<string | null> | null;
        readonly viewer: ({
            readonly completedCount: number | null;
            readonly totalCount: number | null;
        }) | null;
    }) | null;
};



/*
mutation RemoveCompletedTodosMutation(
  $input: RemoveCompletedTodosInput!
) {
  removeCompletedTodos(input: $input) {
    deletedTodoIds
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
    "kind": "LocalArgument",
    "name": "input",
    "type": "RemoveCompletedTodosInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input",
    "type": "RemoveCompletedTodosInput!"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "deletedTodoIds",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "completedCount",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "totalCount",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "RemoveCompletedTodosMutation",
  "id": null,
  "text": "mutation RemoveCompletedTodosMutation(\n  $input: RemoveCompletedTodosInput!\n) {\n  removeCompletedTodos(input: $input) {\n    deletedTodoIds\n    viewer {\n      completedCount\n      totalCount\n      id\n    }\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "RemoveCompletedTodosMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "removeCompletedTodos",
        "storageKey": null,
        "args": v1,
        "concreteType": "RemoveCompletedTodosPayload",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "viewer",
            "storageKey": null,
            "args": null,
            "concreteType": "User",
            "plural": false,
            "selections": [
              v3,
              v4
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "RemoveCompletedTodosMutation",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "removeCompletedTodos",
        "storageKey": null,
        "args": v1,
        "concreteType": "RemoveCompletedTodosPayload",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "viewer",
            "storageKey": null,
            "args": null,
            "concreteType": "User",
            "plural": false,
            "selections": [
              v3,
              v4,
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "id",
                "args": null,
                "storageKey": null
              }
            ]
          }
        ]
      }
    ]
  }
};
})();
(node as any).hash = '303799d791e6e233861ee011ff3bdbb8';
export default node;

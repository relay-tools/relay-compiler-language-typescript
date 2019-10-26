/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type RemoveTodoInput = {
    readonly id: string;
    readonly clientMutationId?: string | null;
};
export type RemoveTodoMutationVariables = {
    input: RemoveTodoInput;
};
export type RemoveTodoMutationResponse = {
    readonly removeTodo: {
        readonly deletedTodoId: string | null;
        readonly viewer: {
            readonly completedCount: number | null;
            readonly totalCount: number | null;
        } | null;
    } | null;
};
export type RemoveTodoMutation = {
    readonly response: RemoveTodoMutationResponse;
    readonly variables: RemoveTodoMutationVariables;
};



/*
mutation RemoveTodoMutation(
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
    "kind": "LocalArgument",
    "name": "input",
    "type": "RemoveTodoInput!",
    "defaultValue": null
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
  "kind": "ScalarField",
  "alias": null,
  "name": "deletedTodoId",
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
  "fragment": {
    "kind": "Fragment",
    "name": "RemoveTodoMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "removeTodo",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveTodoPayload",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "viewer",
            "storageKey": null,
            "args": null,
            "concreteType": "User",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "RemoveTodoMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "removeTodo",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveTodoPayload",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "viewer",
            "storageKey": null,
            "args": null,
            "concreteType": "User",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
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
  },
  "params": {
    "operationKind": "mutation",
    "name": "RemoveTodoMutation",
    "id": null,
    "text": "mutation RemoveTodoMutation(\n  $input: RemoveTodoInput!\n) {\n  removeTodo(input: $input) {\n    deletedTodoId\n    viewer {\n      completedCount\n      totalCount\n      id\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = '560d32d6f18b4072042cf217a41beb97';
export default node;

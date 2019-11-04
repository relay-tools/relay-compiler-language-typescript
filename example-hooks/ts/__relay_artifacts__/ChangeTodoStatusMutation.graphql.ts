/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type ChangeTodoStatusInput = {
    readonly complete: boolean;
    readonly id: string;
    readonly clientMutationId?: string | null;
};
export type ChangeTodoStatusMutationVariables = {
    input: ChangeTodoStatusInput;
};
export type ChangeTodoStatusMutationResponse = {
    readonly changeTodoStatus: {
        readonly todo: {
            readonly id: string;
            readonly complete: boolean | null;
        } | null;
        readonly viewer: {
            readonly id: string;
            readonly completedCount: number | null;
        } | null;
    } | null;
};
export type ChangeTodoStatusMutation = {
    readonly response: ChangeTodoStatusMutationResponse;
    readonly variables: ChangeTodoStatusMutationVariables;
};



/*
mutation ChangeTodoStatusMutation(
  $input: ChangeTodoStatusInput!
) {
  changeTodoStatus(input: $input) {
    todo {
      id
      complete
    }
    viewer {
      id
      completedCount
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "ChangeTodoStatusInput!",
    "defaultValue": null
  }
],
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v2 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "changeTodoStatus",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ChangeTodoStatusPayload",
    "plural": false,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "todo",
        "storageKey": null,
        "args": null,
        "concreteType": "Todo",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "complete",
            "args": null,
            "storageKey": null
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "viewer",
        "storageKey": null,
        "args": null,
        "concreteType": "User",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "completedCount",
            "args": null,
            "storageKey": null
          }
        ]
      }
    ]
  }
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "ChangeTodoStatusMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v2/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "ChangeTodoStatusMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v2/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "ChangeTodoStatusMutation",
    "id": null,
    "text": "mutation ChangeTodoStatusMutation(\n  $input: ChangeTodoStatusInput!\n) {\n  changeTodoStatus(input: $input) {\n    todo {\n      id\n      complete\n    }\n    viewer {\n      id\n      completedCount\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = '82df4993530f2c7019c4cb7382a187fa';
export default node;

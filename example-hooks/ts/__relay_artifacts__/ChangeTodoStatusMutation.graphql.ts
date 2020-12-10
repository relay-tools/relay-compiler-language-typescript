/* tslint:disable */
/* eslint-disable */

import { ConcreteRequest } from "relay-runtime";
export type ChangeTodoStatusInput = {
    complete: boolean;
    id: string;
    clientMutationId?: string | null;
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
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ChangeTodoStatusPayload",
    "kind": "LinkedField",
    "name": "changeTodoStatus",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Todo",
        "kind": "LinkedField",
        "name": "todo",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "complete",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "completedCount",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ChangeTodoStatusMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ChangeTodoStatusMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "add8723f75323848b2de0e56f1e9e0d7",
    "id": null,
    "metadata": {},
    "name": "ChangeTodoStatusMutation",
    "operationKind": "mutation",
    "text": "mutation ChangeTodoStatusMutation(\n  $input: ChangeTodoStatusInput!\n) {\n  changeTodoStatus(input: $input) {\n    todo {\n      id\n      complete\n    }\n    viewer {\n      id\n      completedCount\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '82df4993530f2c7019c4cb7382a187fa';
export default node;

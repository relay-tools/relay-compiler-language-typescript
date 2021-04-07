/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Disposable, IEnvironment, MutationConfig } from "relay-runtime";
import { useMutation } from "react-relay";

export type TodoAppSetAppendingMutationVariables = {
    isAppending: boolean;
};
export type TodoAppSetAppendingMutationResponse = {
    readonly setAppending: {
        readonly isAppending: boolean;
    } | null;
};
export type TodoAppSetAppendingMutation = {
    readonly response: TodoAppSetAppendingMutationResponse;
    readonly variables: TodoAppSetAppendingMutationVariables;
};



/*
mutation TodoAppSetAppendingMutation(
  $isAppending: Boolean!
) {
  setAppending(appending: $isAppending) {
    isAppending
    id
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isAppending"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "appending",
    "variableName": "isAppending"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isAppending",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TodoAppSetAppendingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "setAppending",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "TodoAppSetAppendingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "setAppending",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "cacheID": "148f11e36b0a6e2a3cc889b2f017f1cb",
    "id": null,
    "metadata": {},
    "name": "TodoAppSetAppendingMutation",
    "operationKind": "mutation",
    "text": "mutation TodoAppSetAppendingMutation(\n  $isAppending: Boolean!\n) {\n  setAppending(appending: $isAppending) {\n    isAppending\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '516b4264a3bef2d569158e21caa4d1bd';

export default node;


export function useTodoAppSetAppendingMutation(mutationConfig?: (environment: IEnvironment, config: MutationConfig<TodoAppSetAppendingMutation>) => Disposable) {
  return useMutation<TodoAppSetAppendingMutation>(node, mutationConfig)
}

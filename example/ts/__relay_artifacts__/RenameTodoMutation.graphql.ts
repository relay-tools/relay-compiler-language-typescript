/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type RenameTodoInput = {
    readonly id: string;
    readonly text: string;
    readonly clientMutationId?: string | null;
};
export type RenameTodoMutationVariables = {
    input: RenameTodoInput;
};
export type RenameTodoMutationResponse = {
    readonly renameTodo: {
        readonly todo: {
            readonly id: string;
            readonly text: string | null;
        } | null;
    } | null;
};
export type RenameTodoMutation = {
    readonly response: RenameTodoMutationResponse;
    readonly variables: RenameTodoMutationVariables;
};



/*
mutation RenameTodoMutation(
  $input: RenameTodoInput!
) {
  renameTodo(input: $input) {
    todo {
      id
      text
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "RenameTodoInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "renameTodo",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "RenameTodoPayload",
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
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "id",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "text",
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
    "name": "RenameTodoMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "RenameTodoMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "RenameTodoMutation",
    "id": null,
    "text": "mutation RenameTodoMutation(\n  $input: RenameTodoInput!\n) {\n  renameTodo(input: $input) {\n    todo {\n      id\n      text\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = 'de4aa1639055c2e6a78ee22cce29870a';
export default node;

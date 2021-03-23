/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Disposable, IEnvironment, MutationConfig } from "relay-runtime";
import { useMutation } from "react-relay";

export type RenameTodoInput = {
    id: string;
    text: string;
    clientMutationId?: string | null;
};
export type TodoRenameMutationVariables = {
    input: RenameTodoInput;
};
export type TodoRenameMutationResponse = {
    readonly renameTodo: {
        readonly todo: {
            readonly id: string;
            readonly text: string | null;
        } | null;
    } | null;
};
export type TodoRenameMutation = {
    readonly response: TodoRenameMutationResponse;
    readonly variables: TodoRenameMutationVariables;
};



/*
mutation TodoRenameMutation(
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
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "RenameTodoPayload",
    "kind": "LinkedField",
    "name": "renameTodo",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TodoRenameMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TodoRenameMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3e09fc11947a4d1e386c83a718b8bb9e",
    "id": null,
    "metadata": {},
    "name": "TodoRenameMutation",
    "operationKind": "mutation",
    "text": "mutation TodoRenameMutation(\n  $input: RenameTodoInput!\n) {\n  renameTodo(input: $input) {\n    todo {\n      id\n      text\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'e9abbb3f1e8ecf9ec8ea3a0d51017383';

export default node;


export function useTodoRenameMutation(mutationConfig?: (environment: IEnvironment, config: MutationConfig<TodoRenameMutation>) => Disposable) {
  return useMutation<TodoRenameMutation>(node, mutationConfig)
}

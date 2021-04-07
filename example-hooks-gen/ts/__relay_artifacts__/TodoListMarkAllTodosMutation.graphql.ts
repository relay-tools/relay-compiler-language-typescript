/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Disposable, IEnvironment, MutationConfig } from "relay-runtime";
import { useMutation } from "react-relay";

export type MarkAllTodosInput = {
    complete: boolean;
    clientMutationId?: string | null;
};
export type TodoListMarkAllTodosMutationVariables = {
    input: MarkAllTodosInput;
};
export type TodoListMarkAllTodosMutationResponse = {
    readonly markAllTodos: {
        readonly changedTodos: ReadonlyArray<{
            readonly id: string;
            readonly complete: boolean | null;
        } | null> | null;
        readonly viewer: {
            readonly id: string;
            readonly completedCount: number | null;
        } | null;
    } | null;
};
export type TodoListMarkAllTodosMutation = {
    readonly response: TodoListMarkAllTodosMutationResponse;
    readonly variables: TodoListMarkAllTodosMutationVariables;
};



/*
mutation TodoListMarkAllTodosMutation(
  $input: MarkAllTodosInput!
) {
  markAllTodos(input: $input) {
    changedTodos {
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
    "concreteType": "MarkAllTodosPayload",
    "kind": "LinkedField",
    "name": "markAllTodos",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Todo",
        "kind": "LinkedField",
        "name": "changedTodos",
        "plural": true,
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
    "name": "TodoListMarkAllTodosMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TodoListMarkAllTodosMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "8aef97f374dfee2868dc5c256186628c",
    "id": null,
    "metadata": {},
    "name": "TodoListMarkAllTodosMutation",
    "operationKind": "mutation",
    "text": "mutation TodoListMarkAllTodosMutation(\n  $input: MarkAllTodosInput!\n) {\n  markAllTodos(input: $input) {\n    changedTodos {\n      id\n      complete\n    }\n    viewer {\n      id\n      completedCount\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '5be56bf6c01d1b44affeb6ac31a473cf';

export default node;


export function useTodoListMarkAllTodosMutation(mutationConfig?: (environment: IEnvironment, config: MutationConfig<TodoListMarkAllTodosMutation>) => Disposable) {
  return useMutation<TodoListMarkAllTodosMutation>(node, mutationConfig)
}

/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
import { TodoListFooter_viewer$ref } from "./TodoListFooter_viewer.graphql";
import { TodoList_viewer$ref } from "./TodoList_viewer.graphql";
declare const _TodoApp_viewer$ref: unique symbol;
export type TodoApp_viewer$ref = typeof _TodoApp_viewer$ref;
export type TodoApp_viewer = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly " $fragmentRefs": TodoListFooter_viewer$ref & TodoList_viewer$ref;
    readonly " $refType": TodoApp_viewer$ref;
};



const node: ConcreteFragment = {
  "kind": "Fragment",
  "name": "TodoApp_viewer",
  "type": "User",
  "metadata": null,
  "argumentDefinitions": [],
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
      "name": "totalCount",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TodoListFooter_viewer",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TodoList_viewer",
      "args": null
    }
  ]
};
(node as any).hash = 'b9743417c7b5ef2bbda96cf675aa9eb4';
export default node;

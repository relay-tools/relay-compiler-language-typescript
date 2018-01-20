/* tslint:disable */

import { ConcreteFragment } from 'relay-runtime';
import { FragmentReference } from "relay-runtime";
export enum TodoApp_viewer_ref {
}
export type TodoApp_viewer = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly " $fragments": TodoListFooter_viewer_ref & TodoList_viewer_ref;
    readonly " $refType": TodoApp_viewer_ref;
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

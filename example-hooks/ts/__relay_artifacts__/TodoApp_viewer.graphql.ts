/* tslint:disable */
/* eslint-disable */

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type TodoApp_viewer = {
    readonly id: string;
    readonly totalCount: number;
    readonly " $fragmentRefs": FragmentRefs<"TodoListFooter_viewer" | "TodoList_viewer">;
    readonly " $refType": "TodoApp_viewer";
};
export type TodoApp_viewer$data = TodoApp_viewer;
export type TodoApp_viewer$key = {
    readonly " $data"?: TodoApp_viewer$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoApp_viewer">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoApp_viewer",
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
      "name": "totalCount",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TodoListFooter_viewer"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TodoList_viewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};
(node as any).hash = 'b9743417c7b5ef2bbda96cf675aa9eb4';
export default node;

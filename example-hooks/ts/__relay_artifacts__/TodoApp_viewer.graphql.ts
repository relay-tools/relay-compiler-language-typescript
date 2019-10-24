/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type TodoApp_viewer = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly " $fragmentRefs": FragmentRefs<"TodoListFooter_viewer" | "TodoList_viewer">;
    readonly " $refType": "TodoApp_viewer";
};
export type TodoApp_viewer$data = TodoApp_viewer;
export type TodoApp_viewer$key = {
    readonly " $data"?: TodoApp_viewer$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoApp_viewer">;
};



const node: ReaderFragment = {
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

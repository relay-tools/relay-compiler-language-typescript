/* tslint:disable */
/* eslint-disable */

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type Todo_viewer = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly completedCount: number | null;
    readonly " $refType": "Todo_viewer";
};
export type Todo_viewer$data = Todo_viewer;
export type Todo_viewer$key = {
    readonly " $data"?: Todo_viewer$data;
    readonly " $fragmentRefs": FragmentRefs<"Todo_viewer">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Todo_viewer",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completedCount",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
(node as any).hash = '1e2b17bb7b92d4521c4e72309d996339';
export default node;

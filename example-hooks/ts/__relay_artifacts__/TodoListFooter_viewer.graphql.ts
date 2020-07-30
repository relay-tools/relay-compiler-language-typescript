/* tslint:disable */
/* eslint-disable */

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type TodoListFooter_viewer = {
    readonly id: string;
    readonly completedCount: number | null;
    readonly completedTodos: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly complete: boolean | null;
            } | null;
        } | null> | null;
    } | null;
    readonly totalCount: number;
    readonly " $refType": "TodoListFooter_viewer";
};
export type TodoListFooter_viewer$data = TodoListFooter_viewer;
export type TodoListFooter_viewer$key = {
    readonly " $data"?: TodoListFooter_viewer$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoListFooter_viewer">;
};



const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoListFooter_viewer",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completedCount",
      "storageKey": null
    },
    {
      "alias": "completedTodos",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 2147483647
        },
        {
          "kind": "Literal",
          "name": "status",
          "value": "completed"
        }
      ],
      "concreteType": "TodoConnection",
      "kind": "LinkedField",
      "name": "todos",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TodoEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Todo",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "complete",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "todos(first:2147483647,status:\"completed\")"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();
(node as any).hash = '2490c58e1768d71f3824c1facd127033';
export default node;

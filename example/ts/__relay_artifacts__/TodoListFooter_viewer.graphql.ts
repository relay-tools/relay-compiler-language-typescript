/* tslint:disable */

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
    readonly totalCount: number | null;
    readonly " $refType": "TodoListFooter_viewer";
};
export type TodoListFooter_viewer$data = TodoListFooter_viewer;
export type TodoListFooter_viewer$key = {
    readonly " $data"?: TodoListFooter_viewer$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoListFooter_viewer">;
};



const node: ReaderFragment = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Fragment",
  "name": "TodoListFooter_viewer",
  "type": "User",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    (v0/*: any*/),
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "completedCount",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": "completedTodos",
      "name": "todos",
      "storageKey": "todos(first:2147483647,status:\"completed\")",
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
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "TodoEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "Todo",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "complete",
                  "args": null,
                  "storageKey": null
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "totalCount",
      "args": null,
      "storageKey": null
    }
  ]
};
})();
(node as any).hash = '2490c58e1768d71f3824c1facd127033';
export default node;

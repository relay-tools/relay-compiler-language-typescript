/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { useFragment } from "react-relay";

import { FragmentRefs } from "relay-runtime";
export type TodoListFooterData = {
    readonly id: string;
    readonly isAppending: boolean;
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
    readonly " $refType": "TodoListFooterData";
};
export type TodoListFooterData$data = TodoListFooterData;
export type TodoListFooterData$key = {
    readonly " $data"?: TodoListFooterData$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoListFooterData">;
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
  "name": "TodoListFooterData",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isAppending",
      "storageKey": null
    },
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
(node as any).hash = 'b48858a30dc85d5066a10fcb602a2abe';

export default node;

export function useTodoListFooterDataFragment<TKey extends TodoListFooterData$key>(fragmentRef: TKey): Required<TKey>[" $data"]
export function useTodoListFooterDataFragment<TKey extends TodoListFooterData$key>(fragmentRef: TKey | null): Required<TKey>[" $data"] | null
export function useTodoListFooterDataFragment<TKey extends TodoListFooterData$key>(fragmentRef: ReadonlyArray<TKey>): ReadonlyArray<Required<TKey>[" $data"]>
export function useTodoListFooterDataFragment<TKey extends TodoListFooterData$key>(fragmentRef: ReadonlyArray<TKey | null>): ReadonlyArray<Required<TKey>[" $data"] | null>
export function useTodoListFooterDataFragment<TKey extends TodoListFooterData$key>(fragmentRef: ReadonlyArray<TKey> | null): ReadonlyArray<Required<TKey>[" $data"]> | null
export function useTodoListFooterDataFragment<TKey extends TodoListFooterData$key>(fragmentRef: ReadonlyArray<TKey | null> | null): ReadonlyArray<Required<TKey>[" $data"] | null> | null
export function useTodoListFooterDataFragment(fragmentRef: any) {
  return useFragment(node, fragmentRef)
}

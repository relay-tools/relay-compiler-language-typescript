/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { useFragment } from "react-relay";

import { FragmentRefs } from "relay-runtime";
export type TodoData = {
    readonly complete: boolean | null;
    readonly id: string;
    readonly text: string | null;
    readonly " $refType": "TodoData";
};
export type TodoData$data = TodoData;
export type TodoData$key = {
    readonly " $data"?: TodoData$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoData">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoData",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "complete",
      "storageKey": null
    },
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
  "type": "Todo",
  "abstractKey": null
};
(node as any).hash = 'e183dfc8b268c6f50a3b8890063bd467';

export default node;

export function useTodoDataFragment<TKey extends TodoData$key>(fragmentRef: TKey): Required<TKey>[" $data"]
export function useTodoDataFragment<TKey extends TodoData$key>(fragmentRef: TKey | null): Required<TKey>[" $data"] | null
export function useTodoDataFragment<TKey extends TodoData$key>(fragmentRef: ReadonlyArray<TKey>): ReadonlyArray<Required<TKey>[" $data"]>
export function useTodoDataFragment<TKey extends TodoData$key>(fragmentRef: ReadonlyArray<TKey | null>): ReadonlyArray<Required<TKey>[" $data"] | null>
export function useTodoDataFragment<TKey extends TodoData$key>(fragmentRef: ReadonlyArray<TKey> | null): ReadonlyArray<Required<TKey>[" $data"]> | null
export function useTodoDataFragment<TKey extends TodoData$key>(fragmentRef: ReadonlyArray<TKey | null> | null): ReadonlyArray<Required<TKey>[" $data"] | null> | null
export function useTodoDataFragment(fragmentRef: any) {
  return useFragment(node, fragmentRef)
}

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { useFragment } from "react-relay";

import { FragmentRefs } from "relay-runtime";
export type TodoViewer = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly completedCount: number | null;
    readonly " $refType": "TodoViewer";
};
export type TodoViewer$data = TodoViewer;
export type TodoViewer$key = {
    readonly " $data"?: TodoViewer$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoViewer">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoViewer",
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
(node as any).hash = '1556af1946280519cd5d7050d923b7d2';

export default node;

export function useTodoViewerFragment<TKey extends TodoViewer$key>(fragmentRef: TKey): Required<TKey>[" $data"]
export function useTodoViewerFragment<TKey extends TodoViewer$key>(fragmentRef: TKey | null): Required<TKey>[" $data"] | null
export function useTodoViewerFragment<TKey extends TodoViewer$key>(fragmentRef: ReadonlyArray<TKey>): ReadonlyArray<Required<TKey>[" $data"]>
export function useTodoViewerFragment<TKey extends TodoViewer$key>(fragmentRef: ReadonlyArray<TKey | null>): ReadonlyArray<Required<TKey>[" $data"] | null>
export function useTodoViewerFragment<TKey extends TodoViewer$key>(fragmentRef: ReadonlyArray<TKey> | null): ReadonlyArray<Required<TKey>[" $data"]> | null
export function useTodoViewerFragment<TKey extends TodoViewer$key>(fragmentRef: ReadonlyArray<TKey | null> | null): ReadonlyArray<Required<TKey>[" $data"] | null> | null
export function useTodoViewerFragment(fragmentRef: any) {
  return useFragment(node, fragmentRef)
}

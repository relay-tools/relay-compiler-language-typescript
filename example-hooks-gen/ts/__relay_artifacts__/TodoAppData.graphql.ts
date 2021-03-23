/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { RefetchFnDynamic, useRefetchableFragment } from "react-relay";
import { TodoAppRefetchQuery } from "./TodoAppRefetchQuery.graphql"
import { FragmentRefs } from "relay-runtime";
export type TodoAppData = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly isAppending: boolean;
    readonly " $fragmentRefs": FragmentRefs<"TodoListFooterData" | "TodoList">;
    readonly " $refType": "TodoAppData";
};
export type TodoAppData$data = TodoAppData;
export type TodoAppData$key = {
    readonly " $data"?: TodoAppData$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoAppData">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "after"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "before"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "first"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "last"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./TodoAppRefetchQuery.graphql.ts'),
      "identifierField": "id"
    }
  },
  "name": "TodoAppData",
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
      "name": "isAppending",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TodoListFooterData"
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "after",
          "variableName": "after"
        },
        {
          "kind": "Variable",
          "name": "before",
          "variableName": "before"
        },
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "first"
        },
        {
          "kind": "Variable",
          "name": "last",
          "variableName": "last"
        }
      ],
      "kind": "FragmentSpread",
      "name": "TodoList"
    }
  ],
  "type": "User",
  "abstractKey": null
};
(node as any).hash = '7ad40f3a7433c783610682ad43d6cf5c';

export default node;

export function useRefetchableTodoAppDataFragment<TKey extends TodoAppData$key>(fragmentRef: TKey): [Required<TKey>[" $data"], RefetchFnDynamic<TodoAppRefetchQuery, TodoAppData$key>]
export function useRefetchableTodoAppDataFragment<TKey extends TodoAppData$key>(fragmentRef: TKey | null): [Required<TKey>[" $data"] | null, RefetchFnDynamic<TodoAppRefetchQuery, TodoAppData$key | null>]
export function useRefetchableTodoAppDataFragment(fragmentRef: any) {
  return useRefetchableFragment(node, fragmentRef)
}

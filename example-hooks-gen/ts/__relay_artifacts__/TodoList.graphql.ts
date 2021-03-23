/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { OperationType, ReaderFragment } from "relay-runtime";
import { LoadMoreFn, RefetchFnDynamic, usePaginationFragment } from "react-relay";
import { TodoListRefetchQuery } from "./TodoListRefetchQuery.graphql"
import { FragmentRefs } from "relay-runtime";
export type TodoList = {
    readonly todos: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly complete: boolean | null;
                readonly " $fragmentRefs": FragmentRefs<"TodoData">;
            } | null;
        } | null> | null;
    } | null;
    readonly id: string;
    readonly totalCount: number | null;
    readonly completedCount: number | null;
    readonly " $fragmentRefs": FragmentRefs<"TodoViewer">;
    readonly " $refType": "TodoList";
};
export type TodoList$data = TodoList;
export type TodoList$key = {
    readonly " $data"?: TodoList$data;
    readonly " $fragmentRefs": FragmentRefs<"TodoList">;
};



const node: ReaderFragment = (function(){
var v0 = [
  "todos"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
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
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "bidirectional",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": {
          "count": "last",
          "cursor": "before"
        },
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./TodoListRefetchQuery.graphql.ts'),
      "identifierField": "id"
    }
  },
  "name": "TodoList",
  "selections": [
    {
      "alias": "todos",
      "args": null,
      "concreteType": "TodoConnection",
      "kind": "LinkedField",
      "name": "__TodoList_todos_connection",
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
                (v1/*: any*/),
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
                  "name": "__typename",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "TodoData"
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasPreviousPage",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "startCursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v1/*: any*/),
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TodoViewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();
(node as any).hash = 'ab34e323eebcc0a391c6b6a59bda9a49';

export default node;

interface usePaginationFragmentHookType<TQuery extends OperationType, TKey extends TodoList$key | null, TFragmentData> {
  data: TFragmentData;
  loadNext: LoadMoreFn<TQuery>;
  loadPrevious: LoadMoreFn<TQuery>;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
  refetch: RefetchFnDynamic<TQuery, TKey>;
}

export function usePaginatedTodoList<K extends TodoList$key>(fragmentRef: K): usePaginationFragmentHookType<TodoListRefetchQuery, TodoList$key, Required<K>[" $data"]>
export function usePaginatedTodoList<K extends TodoList$key>(fragmentRef: K | null): usePaginationFragmentHookType<TodoListRefetchQuery, TodoList$key | null, Required<K>[" $data"] | null>;
export function usePaginatedTodoList(fragmentRef: any) {
  return usePaginationFragment<TodoListRefetchQuery, TodoList$key>(node, fragmentRef)
}

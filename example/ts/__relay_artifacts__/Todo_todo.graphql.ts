/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type Todo_todo = {
    readonly complete: boolean | null;
    readonly id: string;
    readonly text: string | null;
    readonly " $refType": "Todo_todo";
};
export type Todo_todo$data = Todo_todo;
export type Todo_todo$key = {
    readonly " $data"?: Todo_todo$data;
    readonly " $fragmentRefs": FragmentRefs<"Todo_todo">;
};



const node: ReaderFragment = {
  "kind": "Fragment",
  "name": "Todo_todo",
  "type": "Todo",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "complete",
      "args": null,
      "storageKey": null
    },
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
      "name": "text",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = '1f979eb84ff026fe8a89323dd533d1fc';
export default node;

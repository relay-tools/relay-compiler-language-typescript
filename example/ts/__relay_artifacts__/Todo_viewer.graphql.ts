/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type Todo_viewer = {
    readonly id: string;
    readonly totalCount: number | null;
    readonly completedCount: number | null;
};



const node: ConcreteFragment = {
  "kind": "Fragment",
  "name": "Todo_viewer",
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
      "kind": "ScalarField",
      "alias": null,
      "name": "completedCount",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = '1e2b17bb7b92d4521c4e72309d996339';
export default node;

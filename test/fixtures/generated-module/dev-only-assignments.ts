/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type CompleteExample = { readonly id: string }


const node: ConcreteFragment = {"the":{"fragment":{"data":42}}};

if (process.env.NODE_ENV !== 'production') {
  (node as any).params.text = "query CompleteExampleQuery { id }";
}
(node as any).hash = 'edcba';
export default node;

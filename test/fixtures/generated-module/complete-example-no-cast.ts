/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type CompleteExample = { readonly id: string }


const node = ({"the":{"fragment":{"data":42}}}) as ConcreteFragment;
(node as any).hash = 'edcba';
export default node;

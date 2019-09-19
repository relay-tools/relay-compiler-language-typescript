/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type CompleteExample = { readonly id: string }


const node: ConcreteFragment = ({ "the": { "fragment": { "data": 42 } } } as any);

(node as any).hash = 'edcba';
export default node;

/* tslint:disable */

import { Fragment } from "relay-runtime";
export type CompleteExample = { readonly id: string }


const node: Fragment = {"the":{"fragment":{"data":42}}};
(node as any).hash = 'edcba';
export default node;

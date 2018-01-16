type OtherFragment$ref = any;
type PictureFragment$ref = any;
type UserFrag1$ref = any;
type UserFrag2$ref = any;
import { FragmentReference } from "relay-runtime";
export type FragmentSpread$ref = FragmentReference;
export interface FragmentSpread {
  readonly id: string;
  readonly justFrag: {
    readonly __fragments: PictureFragment$ref;
  } | null;
  readonly fragAndField: {
    readonly uri: string | null;
    readonly __fragments: PictureFragment$ref;
  } | null;
  readonly __fragments: OtherFragment$ref & UserFrag1$ref & UserFrag2$ref;
  readonly $refType: FragmentSpread$ref;
}

type PageFragment$ref = any;
import { FragmentReference } from "relay-runtime";
export type ConcreateTypes$ref = FragmentReference;
export interface ConcreateTypes {
  readonly actor: {
    readonly __typename: "Page";
    readonly id: string;
    readonly __fragments: PageFragment$ref;
  } | {
    readonly __typename: "User";
    readonly name: string | null;
  } | {
    // This will never be "%other", but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null;
  readonly $refType: ConcreateTypes$ref;
}

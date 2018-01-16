import { FragmentReference } from "relay-runtime";
export type LinkedField$ref = FragmentReference;
export interface LinkedField {
  readonly profilePicture: {
    readonly uri: string | null;
    readonly width: number | null;
    readonly height: number | null;
  } | null;
  readonly hometown: {
    readonly id: string;
    readonly profilePicture: {
      readonly uri: string | null;
    } | null;
  } | null;
  readonly actor: {
    readonly id: string;
  } | null;
  readonly $refType: LinkedField$ref;
}

export interface UnionTypeTestVariables {}
export interface UnionTypeTestResponse {
  readonly neverNode: {
    readonly __typename: "FakeNode";
    readonly id: string;
  } | {
    // This will never be "%other", but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null;
}

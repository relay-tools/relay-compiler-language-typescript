import { FragmentReference } from "relay-runtime";
export type InlineFragment$ref = FragmentReference;
export interface InlineFragment {
  readonly id: string;
  readonly name?: string | null;
  readonly message?: {
    readonly text: string | null;
  } | null;
  readonly $refType: InlineFragment$ref;
}

import { FragmentReference } from "relay-runtime";
export type InlineFragmentWithOverlappingFields$ref = FragmentReference;
export interface InlineFragmentWithOverlappingFields {
  readonly hometown?: {
    readonly id: string;
    readonly name: string | null;
    readonly message?: {
      readonly text: string | null;
    } | null;
  } | null;
  readonly name?: string | null;
  readonly $refType: InlineFragmentWithOverlappingFields$ref;
}

import { FragmentReference } from "relay-runtime";
export type InlineFragmentConditionalID$ref = FragmentReference;
export interface InlineFragmentConditionalID {
  readonly id?: string;
  readonly name?: string | null;
  readonly $refType: InlineFragmentConditionalID$ref;
}

type SomeFragment$ref = any;
import { FragmentReference } from "relay-runtime";
export type InlineFragmentKitchenSink$ref = FragmentReference;
export interface InlineFragmentKitchenSink {
  readonly actor: {
    readonly id: string;
    readonly profilePicture: {
      readonly uri: string | null;
      readonly width?: number | null;
      readonly height?: number | null;
    } | null;
    readonly name?: string | null;
    readonly __fragments: SomeFragment$ref;
  } | null;
  readonly $refType: InlineFragmentKitchenSink$ref;
}

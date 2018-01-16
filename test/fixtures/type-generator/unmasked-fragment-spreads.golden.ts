import { PhotoFragment$ref } from "PhotoFragment.graphql";
import { FragmentReference } from "relay-runtime";
export type UserProfile$ref = FragmentReference;
export interface UserProfile {
  readonly profilePicture: {
    readonly uri: string | null;
    readonly width: number | null;
    readonly height: number | null;
    readonly __fragments: PhotoFragment$ref;
  } | null;
  readonly $refType: UserProfile$ref;
}

import { FragmentReference } from "relay-runtime";
export type PhotoFragment$ref = FragmentReference;
export interface PhotoFragment {
  readonly uri: string | null;
  readonly width: number | null;
  readonly $refType: PhotoFragment$ref;
}

import { FragmentReference } from "relay-runtime";
export type RecursiveFragment$ref = FragmentReference;
export interface RecursiveFragment {
  readonly uri: string | null;
  readonly width: number | null;
  readonly $refType: RecursiveFragment$ref;
}

import { FragmentReference } from "relay-runtime";
export type AnotherRecursiveFragment$ref = FragmentReference;
export interface AnotherRecursiveFragment {
  readonly uri: string | null;
  readonly height: number | null;
  readonly $refType: AnotherRecursiveFragment$ref;
}

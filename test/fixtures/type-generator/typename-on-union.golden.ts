import { FragmentReference } from "relay-runtime";
export type TypenameInside$ref = FragmentReference;
export type TypenameInside = {
  readonly __typename: "User";
  readonly firstName: string | null;
  readonly $refType: TypenameInside$ref;
} | {
  readonly __typename: "Page";
  readonly username: string | null;
  readonly $refType: TypenameInside$ref;
} | {
  // This will never be "%other", but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly $refType: TypenameInside$ref;
};

import { FragmentReference } from "relay-runtime";
export type TypenameOutside$ref = FragmentReference;
export type TypenameOutside = {
  readonly __typename: "User";
  readonly firstName: string | null;
  readonly $refType: TypenameOutside$ref;
} | {
  readonly __typename: "Page";
  readonly username: string | null;
  readonly $refType: TypenameOutside$ref;
} | {
  // This will never be "%other", but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly $refType: TypenameOutside$ref;
};

import { FragmentReference } from "relay-runtime";
export type TypenameOutsideWithAbstractType$ref = FragmentReference;
export interface TypenameOutsideWithAbstractType {
  readonly __typename: string;
  readonly username?: string | null;
  readonly address?: {
    readonly city: string | null;
    readonly country: string | null;
    readonly street?: string | null;
  } | null;
  readonly firstName?: string | null;
  readonly $refType: TypenameOutsideWithAbstractType$ref;
}

import { FragmentReference } from "relay-runtime";
export type TypenameWithoutSpreads$ref = FragmentReference;
export interface TypenameWithoutSpreads {
  readonly firstName: string | null;
  readonly __typename: "User";
  readonly $refType: TypenameWithoutSpreads$ref;
}

import { FragmentReference } from "relay-runtime";
export type TypenameWithoutSpreadsAbstractType$ref = FragmentReference;
export interface TypenameWithoutSpreadsAbstractType {
  readonly __typename: string;
  readonly id: string;
  readonly $refType: TypenameWithoutSpreadsAbstractType$ref;
}

import { FragmentReference } from "relay-runtime";
export type TypenameWithCommonSelections$ref = FragmentReference;
export interface TypenameWithCommonSelections {
  readonly __typename: string;
  readonly name: string | null;
  readonly firstName?: string | null;
  readonly username?: string | null;
  readonly $refType: TypenameWithCommonSelections$ref;
}

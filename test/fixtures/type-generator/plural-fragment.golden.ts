import { FragmentReference } from "relay-runtime";
export type PluralFragment$ref = FragmentReference;
export type PluralFragment = ReadonlyArray<{
  readonly id: string;
  readonly $refType: PluralFragment$ref;
}>;

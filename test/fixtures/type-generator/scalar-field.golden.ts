export type PersonalityTraits = "CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY" | "%future added value";
import { FragmentReference } from "relay-runtime";
export type ScalarField$ref = FragmentReference;
export interface ScalarField {
  readonly id: string;
  readonly name: string | null;
  readonly websites: ReadonlyArray<string | null> | null;
  readonly traits: ReadonlyArray<PersonalityTraits | null> | null;
  readonly aliasedLinkedField: {
    readonly aliasedField: number | null;
  } | null;
  readonly screennames: ReadonlyArray<{
    readonly name: string | null;
    readonly service: string | null;
  } | null> | null;
  readonly $refType: ScalarField$ref;
}

export interface ExampleQueryVariables {
  id: string;
}
export interface ExampleQueryResponse {
  readonly node: {
    readonly id: string;
  } | null;
}

import { FragmentReference } from "relay-runtime";
export type ExampleFragment$ref = FragmentReference;
export interface ExampleFragment {
  readonly id: string;
  readonly $refType: ExampleFragment$ref;
}

export interface TestMutationVariables {
  input: {
    clientMutationId?: string | null;
    feedbackId?: string | null;
  };
}
export interface TestMutationResponse {
  readonly commentCreate: {
    readonly comment: {
      readonly id: string;
    } | null;
  } | null;
}

export interface TestSubscriptionVariables {
  input?: {
    clientMutationId?: string | null;
    feedbackId?: string | null;
  } | null;
}
export interface TestSubscriptionResponse {
  readonly feedbackLikeSubscribe: {
    readonly feedback: {
      readonly id: string;
    } | null;
  } | null;
}

export interface CommentCreateMutationVariables {
  input: {
    clientMutationId?: string | null;
    feedbackId?: string | null;
  };
  first?: number | null;
  orderBy?: ReadonlyArray<string> | null;
}
export interface CommentCreateMutationResponse {
  readonly commentCreate: {
    readonly comment: {
      readonly id: string;
      readonly name: string | null;
      readonly friends: {
        readonly count: number | null;
      } | null;
    } | null;
  } | null;
}

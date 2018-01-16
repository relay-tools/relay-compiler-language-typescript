export interface InputHasArrayVariables {
  input?: {
    clientMutationId?: string | null;
    storyIds?: ReadonlyArray<string | null> | null;
  } | null;
}
export interface InputHasArrayResponse {
  readonly viewerNotificationsUpdateAllSeenState: {
    readonly stories: ReadonlyArray<{
      readonly actorCount: number | null;
    } | null> | null;
  } | null;
}

import React from "react"
import { graphql } from "react-relay"
import {
  loadAppInitialStateQuery,
  usePreloadedAppInitialStateQuery,
} from "../__relay_artifacts__/appInitialStateQuery.graphql"

import { useTodoRootQuery } from "../__relay_artifacts__/TodoRootQuery.graphql"

import TodoApp from "./TodoApp"

graphql`
  query TodoRootQuery($first: Int, $last: Int) {
    viewer {
      ...TodoAppData @arguments(first: $first, last: $last)
    }
  }
`

const TodoRoot: React.FC<{ isAppending: boolean }> = ({ isAppending }) => {
  const { viewer } = useTodoRootQuery(
    isAppending ? { last: 10 } : { first: 10 },
  )
  return <TodoApp frag={viewer!} />
}

const TodoRootWrapper: React.FC<{
  queryRef: ReturnType<typeof loadAppInitialStateQuery>
}> = ({ queryRef }) => {
  const result = usePreloadedAppInitialStateQuery(queryRef)
  return (
    <>
      {result.viewer && <TodoRoot isAppending={result.viewer?.isAppending} />}
    </>
  )
}

export default TodoRootWrapper
